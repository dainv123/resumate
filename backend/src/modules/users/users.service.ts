import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { UserUsage } from './entities/user-usage.entity';
import { UpdateProfileDto, ChangePasswordDto } from './dto/update-user.dto';
import { Cv } from '../cv/entities/cv.entity';
import { Project } from '../projects/entities/project.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserUsage)
    private userUsageRepository: Repository<UserUsage>,
    @InjectRepository(Cv)
    private cvRepository: Repository<Cv>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
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

  async updateProfile(id: string, updateProfileDto: UpdateProfileDto): Promise<User> {
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

  async changePassword(user: User, changePasswordDto: ChangePasswordDto): Promise<{ message: string }> {
    const { oldPassword, newPassword } = changePasswordDto;

    // Check if user has a password (not Google auth only)
    if (!user.password) {
      throw new BadRequestException('Cannot change password for Google authenticated accounts');
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
      if (cv.parsedData?.experience && Array.isArray(cv.parsedData.experience)) {
        return count + cv.parsedData.experience.reduce((expCount, exp) => {
          return expCount + (Array.isArray(exp.subProjects) ? exp.subProjects.length : 0);
        }, 0);
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
      cvs: cvs.map(cv => ({
        id: cv.id,
        originalFileName: cv.originalFileName,
        isTailored: cv.isTailored,
        parsedData: cv.parsedData,
        createdAt: cv.createdAt,
        updatedAt: cv.updatedAt,
      })),
      projects: projects.map(project => ({
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
    const user = await this.findById(userId);

    // Delete all related data (cascade delete should handle this, but we'll be explicit)
    await this.cvRepository.delete({ userId });
    await this.projectRepository.delete({ userId });
    await this.userUsageRepository.delete({ userId });

    // Delete user
    await this.userRepository.remove(user);

    return { message: 'Account deleted successfully' };
  }

  async getUserUsage(userId: string): Promise<UserUsage> {
    let usage = await this.userUsageRepository.findOne({ 
      where: { userId } 
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
    
    if (now.getMonth() !== resetDate.getMonth() || now.getFullYear() !== resetDate.getFullYear()) {
      usage.cvUploads = 0;
      usage.projects = 0;
      usage.jobTailors = 0;
      usage.exports = 0;
      usage.resetDate = now;
      usage = await this.userUsageRepository.save(usage);
    }

    return usage;
  }

  async incrementUsage(userId: string, feature: keyof UserUsage): Promise<void> {
    const usage = await this.getUserUsage(userId);
    (usage as any)[feature] = ((usage as any)[feature] as number) + 1;
    await this.userUsageRepository.save(usage);
  }

  async checkUserLimit(userId: string, feature: string): Promise<boolean> {
    return true;
    const user = await this.findById(userId);
    const usage = await this.getUserUsage(userId);
    
    const limits = {
      free: { 
        cvUploads: 1, 
        projects: 3, 
        jobTailors: 5, 
        exports: 10 
      },
      pro: { 
        cvUploads: -1, 
        projects: -1, 
        jobTailors: -1, 
        exports: -1 
      }
    };
    
    const userLimit = limits[user.plan][feature];
    return userLimit === -1 || (usage[feature] as number) < userLimit;
  }
}