import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobDescription } from './entities/job-description.entity';

@Injectable()
export class JobDescriptionService {
  constructor(
    @InjectRepository(JobDescription)
    private jobDescriptionRepository: Repository<JobDescription>,
  ) {}

  async createJobDescription(
    userId: string,
    title: string,
    description: string,
    company?: string,
    location?: string,
    salary?: string,
    experience?: string,
  ): Promise<JobDescription> {
    const jobDescription = this.jobDescriptionRepository.create({
      userId,
      title,
      description,
      company,
      location,
      salary,
      experience,
      requirements: {
        skills: [],
        education: [],
        experience: [],
        certifications: []
      },
      keywords: [],
    });

    return this.jobDescriptionRepository.save(jobDescription);
  }

  async getJobDescriptionById(id: string, userId: string): Promise<JobDescription> {
    const jobDescription = await this.jobDescriptionRepository.findOne({
      where: { id, userId },
    });

    if (!jobDescription) {
      throw new Error('Job description not found');
    }

    return jobDescription;
  }

  async getUserJobDescriptions(userId: string): Promise<JobDescription[]> {
    return this.jobDescriptionRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }
}