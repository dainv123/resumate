import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { Cv } from '../cv/entities/cv.entity';
import { AiService } from '../ai/ai.service';
import { UsersService } from '../users/users.service';
import { CreateProjectDto, UpdateProjectDto, AddToCvDto } from './dto/project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(Cv)
    private cvRepository: Repository<Cv>,
    private aiService: AiService,
    private usersService: UsersService,
  ) {}

  async createProject(userId: string, createProjectDto: CreateProjectDto): Promise<Project> {
    // Check user limits
    const canAddProject = await this.usersService.checkUserLimit(userId, 'projects');
    if (!canAddProject) {
      throw new BadRequestException('Project limit reached for your plan');
    }

    // Generate AI bullet points
    const cvBullets = await this.aiService.generateProjectBullets({
      name: createProjectDto.name,
      role: createProjectDto.role,
      techStack: createProjectDto.techStack,
      results: createProjectDto.results,
    });

    const project = this.projectRepository.create({
      ...createProjectDto,
      userId,
      cvBullets,
    });

    const savedProject = await this.projectRepository.save(project);

    // Increment usage
    await this.usersService.incrementUsage(userId, 'projects');

    return savedProject;
  }

  async getUserProjects(userId: string): Promise<Project[]> {
    return this.projectRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getProjectById(id: string, userId: string): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id, userId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  async updateProject(id: string, userId: string, updateProjectDto: UpdateProjectDto): Promise<Project> {
    const project = await this.getProjectById(id, userId);

    // If tech stack or results changed, regenerate bullets
    if (updateProjectDto.techStack || updateProjectDto.results) {
      const cvBullets = await this.aiService.generateProjectBullets({
        name: updateProjectDto.name || project.name,
        role: updateProjectDto.role || project.role,
        techStack: updateProjectDto.techStack || project.techStack,
        results: updateProjectDto.results || project.results,
      });
      (updateProjectDto as any).cvBullets = cvBullets;
    }

    Object.assign(project, updateProjectDto);
    return this.projectRepository.save(project);
  }

  async deleteProject(id: string, userId: string): Promise<void> {
    const project = await this.getProjectById(id, userId);
    await this.projectRepository.remove(project);
  }

  async addProjectToCv(projectId: string, userId: string, addToCvDto: AddToCvDto): Promise<Cv> {
    const project = await this.getProjectById(projectId, userId);
    const cv = await this.cvRepository.findOne({
      where: { id: addToCvDto.cvId, userId },
    });

    if (!cv) {
      throw new NotFoundException('CV not found');
    }

    // Add project to CV
    const projectData = {
      name: project.name,
      description: project.description,
      techStack: project.techStack,
      results: project.results,
      link: project.demoLink,
    };

    cv.parsedData.projects.push(projectData);
    cv.version += 1;

    // Mark project as added to CV
    project.isAddedToCv = true;
    await this.projectRepository.save(project);

    return this.cvRepository.save(cv);
  }

  async removeProjectFromCv(projectId: string, userId: string, cvId: string): Promise<Cv> {
    const project = await this.getProjectById(projectId, userId);
    const cv = await this.cvRepository.findOne({
      where: { id: cvId, userId },
    });

    if (!cv) {
      throw new NotFoundException('CV not found');
    }

    // Remove project from CV
    cv.parsedData.projects = cv.parsedData.projects.filter(
      p => p.name !== project.name
    );
    cv.version += 1;

    // Mark project as not added to CV
    project.isAddedToCv = false;
    await this.projectRepository.save(project);

    return this.cvRepository.save(cv);
  }

  async regenerateProjectBullets(projectId: string, userId: string): Promise<Project> {
    const project = await this.getProjectById(projectId, userId);

    const cvBullets = await this.aiService.generateProjectBullets({
      name: project.name,
      role: project.role,
      techStack: project.techStack,
      results: project.results,
    });

    project.cvBullets = cvBullets;
    return this.projectRepository.save(project);
  }

  async getProjectsForPortfolio(userId: string): Promise<Project[]> {
    return this.projectRepository.find({
      where: { userId },
      select: ['id', 'name', 'description', 'techStack', 'demoLink', 'githubLink', 'imageUrl'],
      order: { createdAt: 'DESC' },
    });
  }
}