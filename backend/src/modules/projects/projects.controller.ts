import { 
  Controller, 
  Post, 
  Get, 
  Put, 
  Delete,
  Body, 
  Param, 
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto, AddToCvDto } from './dto/project.dto';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';
import { RateLimitGuard } from '../../common/guards/rate-limit.guard';
import { UsageGuard } from '../../common/guards/usage.guard';
import { RateLimit } from '../../common/decorators/rate-limit.decorator';
import { CheckUsage } from '../../common/decorators/check-usage.decorator';
import { UsersService } from '../users/users.service';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(
    private projectsService: ProjectsService,
    private usersService: UsersService,
  ) {}

  @Post()
  @UseGuards(RateLimitGuard, UsageGuard)
  @RateLimit(20, 'minute')
  @CheckUsage('projects')
  async createProject(
    @GetUser() user: User,
    @Body() createProjectDto: CreateProjectDto,
  ) {
    const project = await this.projectsService.createProject(user.id, createProjectDto);
    
    // Increment usage
    await this.usersService.incrementUsage(user.id, 'projects');
    
    // Get usage info
    const usage = await this.usersService.getUserUsage(user.id);
    const limits = this.usersService.getLimits(user.plan);
    
    return {
      ...project,
      usage: {
        projects: {
          used: usage.projects,
          limit: limits.projects,
        },
        resetsAt: usage.resetDate,
      },
    };
  }

  @Get()
  async getUserProjects(@GetUser('id') userId: string) {
    return this.projectsService.getUserProjects(userId);
  }

  @Get('portfolio')
  async getProjectsForPortfolio(@GetUser('id') userId: string) {
    return this.projectsService.getProjectsForPortfolio(userId);
  }

  @Get(':id')
  async getProject(
    @Param('id') id: string,
    @GetUser('id') userId: string,
  ) {
    return this.projectsService.getProjectById(id, userId);
  }

  @Put(':id')
  async updateProject(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    return this.projectsService.updateProject(id, userId, updateProjectDto);
  }

  @Delete(':id')
  async deleteProject(
    @Param('id') id: string,
    @GetUser('id') userId: string,
  ) {
    await this.projectsService.deleteProject(id, userId);
    return { message: 'Project deleted successfully' };
  }

  @Post(':id/add-to-cv')
  async addProjectToCv(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @Body() addToCvDto: AddToCvDto,
  ) {
    return this.projectsService.addProjectToCv(id, userId, addToCvDto);
  }

  @Post(':id/remove-from-cv')
  async removeProjectFromCv(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @Body() body: { cvId: string },
  ) {
    return this.projectsService.removeProjectFromCv(id, userId, body.cvId);
  }

  @Post(':id/regenerate-bullets')
  async regenerateProjectBullets(
    @Param('id') id: string,
    @GetUser('id') userId: string,
  ) {
    return this.projectsService.regenerateProjectBullets(id, userId);
  }
}