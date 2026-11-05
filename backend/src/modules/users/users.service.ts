import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { UserUsage } from './entities/user-usage.entity';
import { UpdateProfileDto, ChangePasswordDto } from './dto/update-user.dto';
import { Cv } from '../cv/entities/cv.entity';
import { Project } from '../projects/entities/project.entity';
import { RedisKey } from '../../shared/redis/redis.constants';
import { RedisService } from '../../shared/redis/redis.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserUsage)
    private userUsageRepository: Repository<UserUsage>,
    @InjectRepository(Cv)
    private cvRepository: Repository<Cv>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    private dataSource: DataSource,
    private redisService: RedisService,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async updateProfile(
    id: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<User> {
    const user = await this.findById(id);

    // Only update allowed fields
    if (updateProfileDto.name !== undefined) {
      user.name = updateProfileDto.name;
    }
    if (updateProfileDto.avatar !== undefined) {
      user.avatar = updateProfileDto.avatar;
    }

    const updatedUser = await this.userRepository.save(user);

    // Remove password from response
    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword as User;
  }

  async changePassword(
    user: User,
    changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const { oldPassword, newPassword } = changePasswordDto;

    // Check if user has a password (not Google auth only)
    if (!user.password) {
      throw new BadRequestException(
        'Cannot change password for Google authenticated accounts',
      );
    }

    // Verify old password
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash and save new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    await this.userRepository.save(user);

    return { message: 'Password changed successfully' };
  }

  async getUserStats(userId: string) {
    const [cvCount, projectCount, tailoredCvCount, cvs] = await Promise.all([
      this.cvRepository.count({ where: { userId } }),
      this.projectRepository.count({ where: { userId } }),
      this.cvRepository.count({ where: { userId, isTailored: true } }),
      this.cvRepository.find({ where: { userId } }),
    ]);

    // Count total subProjects from all CVs
    const totalSubProjects = cvs.reduce((count, cv) => {
      if (
        cv.parsedData?.experience &&
        Array.isArray(cv.parsedData.experience)
      ) {
        return (
          count +
          cv.parsedData.experience.reduce((expCount, exp) => {
            return (
              expCount +
              (Array.isArray((exp as any).subProjects)
                ? (exp as any).subProjects.length
                : 0)
            );
          }, 0)
        );
      }
      return count;
    }, 0);

    const user = await this.findById(userId);

    return {
      totalCvs: cvCount,
      totalProjects: projectCount,
      totalSubProjects,
      tailoredCvs: tailoredCvCount,
      plan: user.plan,
      createdAt: user.createdAt,
    };
  }

  async exportUserData(userId: string) {
    const user = await this.findById(userId);
    const cvs = await this.cvRepository.find({ where: { userId } });
    const projects = await this.projectRepository.find({ where: { userId } });
    const usage = await this.getUserUsage(userId);

    // Remove sensitive data
    const { password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      cvs: cvs.map((cv) => ({
        id: cv.id,
        originalFileName: cv.originalFileName,
        isTailored: cv.isTailored,
        parsedData: cv.parsedData,
        createdAt: cv.createdAt,
        updatedAt: cv.updatedAt,
      })),
      projects: projects.map((project) => ({
        id: project.id,
        name: project.name,
        description: project.description,
        role: project.role,
        techStack: project.techStack,
        results: project.results,
        demoLink: project.demoLink,
        githubLink: project.githubLink,
        createdAt: project.createdAt,
      })),
      usage,
      exportedAt: new Date().toISOString(),
    };
  }

  async deleteAccount(userId: string): Promise<{ message: string }> {
    await this.findById(userId);

    const portfolios: Array<{ username: string }> = await this.dataSource.query(
      `SELECT username FROM portfolios WHERE "userId" = $1`,
      [userId],
    );

    // These tables reference users with ON DELETE NO ACTION. One transaction
    // removes them before the user so a rejected user delete cannot keep
    // the earlier resume deletes.
    await this.dataSource.transaction(async (manager) => {
      const statements = [
        `DELETE FROM interview_question_assignments
         WHERE "planId" IN (
           SELECT id FROM interview_prep_plans WHERE "userId" = $1
         )`,
        `DELETE FROM interview_prep_plans WHERE "userId" = $1`,
        `DELETE FROM cv_matching_analyses WHERE "userId" = $1`,
        `DELETE FROM cv_cover_letters WHERE "userId" = $1`,
        `DELETE FROM cvs WHERE "userId" = $1`,
        `DELETE FROM job_descriptions WHERE "userId" = $1`,
        `DELETE FROM projects WHERE "userId" = $1`,
        `DELETE FROM portfolios WHERE "userId" = $1`,
        `DELETE FROM analytics WHERE "userId" = $1`,
        `DELETE FROM user_usage WHERE "userId" = $1`,
        `DELETE FROM users WHERE id = $1`,
      ];

      for (const sql of statements) {
        await manager.query(sql, [userId]);
      }
    });

    await Promise.all(
      portfolios.map(async (row) => {
        try {
          await this.redisService.del(RedisKey.portfolioHtml(row.username));
        } catch (error) {
          this.logger.warn(
            `Portfolio cache clear failed for ${row.username}: ${(error as Error).message}`,
          );
        }
      }),
    );

    return { message: 'Account deleted successfully' };
  }

  async getUserUsage(userId: string): Promise<UserUsage> {
    let usage = await this.userUsageRepository.findOne({
      where: { userId },
    });

    if (!usage) {
      usage = this.userUsageRepository.create({
        userId,
        resetDate: new Date(),
      });
      usage = await this.userUsageRepository.save(usage);
    }

    // Check if usage needs to be reset (monthly)
    const now = new Date();
    const resetDate = new Date(usage.resetDate);

    if (
      now.getMonth() !== resetDate.getMonth() ||
      now.getFullYear() !== resetDate.getFullYear()
    ) {
      usage.cvUploads = 0;
      usage.projects = 0;
      usage.jobTailors = 0;
      usage.exports = 0;
      usage.interviewPrepPlans = 0;
      usage.mockDrills = 0;
      usage.resetDate = now;
      usage = await this.userUsageRepository.save(usage);
    }

    return usage;
  }

  async incrementUsage(
    userId: string,
    feature: keyof UserUsage,
  ): Promise<void> {
    const usage = await this.getUserUsage(userId);
    (usage as any)[feature] = ((usage as any)[feature] as number) + 1;
    await this.userUsageRepository.save(usage);
  }

  async checkUserLimit(userId: string, feature: string): Promise<boolean> {
    const user = await this.findById(userId);
    const usage = await this.getUserUsage(userId);

    const limits: Record<string, Record<string, number>> = {
      free: {
        cvUploads: 1,
        projects: 3,
        jobTailors: 5,
        exports: 10,
        interviewPrepPlans: 1,
        mockDrills: 3,
      },
      pro: {
        cvUploads: -1,
        projects: -1,
        jobTailors: -1,
        exports: -1,
        interviewPrepPlans: -1,
        mockDrills: -1,
      },
    };

    const planLimits = limits[user.plan] ?? limits.free;
    const userLimit = planLimits[feature];
    if (userLimit === undefined) return true;
    return userLimit === -1 || (usage[feature] as number) < userLimit;
  }
}
