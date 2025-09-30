import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserUsage } from './entities/user-usage.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserUsage)
    private userUsageRepository: Repository<UserUsage>,
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

  async updateProfile(id: string, updateData: Partial<User>): Promise<User> {
    const user = await this.findById(id);
    Object.assign(user, updateData);
    return this.userRepository.save(user);
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