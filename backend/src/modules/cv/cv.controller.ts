import { 
  Controller, 
  Post, 
  Get, 
  Put, 
  Delete,
  Body, 
  Param, 
  UseGuards, 
  UseInterceptors, 
  UploadedFile,
  Query,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CvService } from './cv.service';
import { ExportService } from '../../shared/services/export.service';
import { UpdateCvDto, TailorCvDto } from './dto/cv.dto';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { TrackActivity } from '../../common/decorators/track-activity.decorator';
import { ActivityType } from '../../common/enums/activity-type.enum';
import { User } from '../users/entities/user.entity';
import { RateLimitGuard } from '../../common/guards/rate-limit.guard';
import { UsageGuard } from '../../common/guards/usage.guard';
import { RateLimit } from '../../common/decorators/rate-limit.decorator';
import { CheckUsage } from '../../common/decorators/check-usage.decorator';
import { UsersService } from '../users/users.service';

@Controller('cv')
@UseGuards(JwtAuthGuard)
export class CvController {
  constructor(
    private cvService: CvService,
    private exportService: ExportService,
    private usersService: UsersService,
  ) {}

  @Post('upload')
  @UseGuards(RateLimitGuard, UsageGuard)
  @RateLimit(10, 'minute')
  @CheckUsage('cvUploads')
  @UseInterceptors(FileInterceptor('file'))
  @TrackActivity(ActivityType.CV_UPLOADED, {
    getMetadata: (cv, args) => ({
      fileName: cv.originalFileName,
      fileSize: cv.fileSize,
    }),
  })
  async uploadCv(
    @GetUser() user: User,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const cv = await this.cvService.uploadCv(user.id, file);
    
    // Increment usage
    await this.usersService.incrementUsage(user.id, 'cvUploads');
    
    // Get usage info
    const usage = await this.usersService.getUserUsage(user.id);
    const limits = this.usersService.getLimits(user.plan);
    
    return {
      ...cv,
      usage: {
        cvUploads: {
          used: usage.cvUploads,
          limit: limits.cvUploads,
        },
        resetsAt: usage.resetDate,
      },
    };
  }

  @Get()
  async getUserCvs(@GetUser('id') userId: string) {
    return this.cvService.getUserCvs(userId);
  }

  @Get(':id')
  async getCv(
    @Param('id') id: string, 
    @GetUser('id') userId: string,
  ) {
    return this.cvService.getCvById(id, userId);
  }

  @Get(':id/with-relations')
  async getCvWithRelations(
    @Param('id') id: string, 
    @GetUser('id') userId: string,
  ) {
    return this.cvService.getCvWithRelations(id, userId);
  }

  @Put(':id')
  @TrackActivity(ActivityType.CV_EDITED)
  async updateCv(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @Body() updateCvDto: UpdateCvDto,
  ) {
    return this.cvService.updateCv(id, userId, updateCvDto);
  }


  @Get(':id/suggestions')
  async getSuggestions(
    @Param('id') id: string,
    @GetUser('id') userId: string,
  ) {
    return this.cvService.getSuggestions(id, userId);
  }

  @Get(':id/versions')
  async getCvVersions(
    @Param('id') id: string,
    @GetUser('id') userId: string,
  ) {
    return this.cvService.getCvVersions(id, userId);
  }

  @Get(':id/export/pdf')
  @UseGuards(RateLimitGuard, UsageGuard)
  @RateLimit(20, 'minute')
  @CheckUsage('exports')
  @TrackActivity(ActivityType.CV_EXPORTED, {
    getResourceId: (result, context) => context.params.id,
    getMetadata: (result, context) => ({ 
      format: 'pdf', 
      template: context.query.template || 'professional' 
    }),
  })
  async exportToPDF(
    @Param('id') id: string,
    @GetUser() user: User,
    @Query('template') template: string = 'professional',
    @Res() res: Response,
  ) {
    const cv = await this.cvService.getCvById(id, user.id);
    const pdfBuffer = await this.exportService.exportToPDF(cv.parsedData, template);
    
    // Increment usage
    await this.usersService.incrementUsage(user.id, 'exports');
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${cv.originalFileName.replace(/\.[^/.]+$/, '')}.pdf"`,
    });
    
    res.send(pdfBuffer);
  }

  @Get(':id/export/word')
  @UseGuards(RateLimitGuard, UsageGuard)
  @RateLimit(20, 'minute')
  @CheckUsage('exports')
  @TrackActivity(ActivityType.CV_EXPORTED, {
    getResourceId: (result, context) => context.params.id,
    getMetadata: () => ({ format: 'word', template: 'default' }),
  })
  async exportToWord(
    @Param('id') id: string,
    @GetUser() user: User,
    @Res() res: Response,
  ) {
    const cv = await this.cvService.getCvById(id, user.id);
    const wordBuffer = await this.exportService.exportToWord(cv.parsedData);
    
    // Increment usage
    await this.usersService.incrementUsage(user.id, 'exports');
    
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${cv.originalFileName.replace(/\.[^/.]+$/, '')}.docx"`,
    });
    
    res.send(wordBuffer);
  }

  @Get(':id/export/ats')
  @TrackActivity(ActivityType.CV_EXPORTED, {
    getResourceId: (result, context) => context.params.id,
    getMetadata: () => ({ format: 'ats', template: 'text' }),
  })
  async exportToATS(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @Res() res: Response,
  ) {
    const cv = await this.cvService.getCvById(id, userId);
    const atsBuffer = await this.exportService.exportToATS(cv.parsedData);
    
    res.set({
      'Content-Type': 'text/plain',
      'Content-Disposition': `attachment; filename="${cv.originalFileName.replace(/\.[^/.]+$/, '')}_ats.txt"`,
    });
    
    res.send(atsBuffer);
  }

  @Delete(':id')
  async deleteCv(
    @Param('id') id: string,
    @GetUser('id') userId: string,
  ) {
    await this.cvService.deleteCv(id, userId);
    return { message: 'CV deleted successfully' };
  }

  @Post(':id/duplicate')
  async duplicateCv(
    @Param('id') id: string,
    @GetUser('id') userId: string,
  ) {
    const duplicatedCv = await this.cvService.duplicateCv(id, userId);
    return duplicatedCv;
  }

  @Post(':id/restore/:version')
  async restoreVersion(
    @Param('id') id: string,
    @Param('version') version: string,
    @GetUser('id') userId: string,
  ) {
    const restoredCv = await this.cvService.restoreVersion(id, userId, parseInt(version));
    return restoredCv;
  }

  @Post(':id/tailor')
  @TrackActivity(ActivityType.CV_TAILORED)
  async tailorCv(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @Body() tailorCvDto: TailorCvDto,
  ) {
    return this.cvService.tailorCv(id, userId, tailorCvDto.jobDescription);
  }

  @Post(':id/analyze-compatibility')
  async analyzeCompatibility(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @Body() body: { jobDescription: string },
  ) {
    return this.cvService.analyzeCompatibility(id, userId, body.jobDescription);
  }

  @Post(':id/generate-cover-letter')
  async generateCoverLetter(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @Body() body: { jobDescription: string },
  ) {
    return this.cvService.generateCoverLetter(id, userId, body.jobDescription);
  }

  @Get('template/test')
  async testTemplate(
    @GetUser('id') userId: string,
    @Query('template') template: string = 'two-column',
    @Res() res: Response,
  ) {
    // Create sample CV data for testing
    const sampleCvData = {
      name: 'Nguyen Van Test',
      email: 'test@example.com',
      phone: '+84 123 456 789',
      address: 'Ho Chi Minh City, Vietnam',
      linkedin: 'https://linkedin.com/in/test',
      summary: 'Experienced software developer with 5+ years in full-stack development. Passionate about creating innovative solutions and leading technical teams.',
      experience: [
        {
          title: 'Senior Full Stack Developer',
          company: 'Tech Company ABC',
          duration: '2022 - Present',
          responsibilities: [
            'Lead development of web applications using React and Node.js',
            'Mentor junior developers and conduct code reviews',
            'Implement CI/CD pipelines and DevOps practices'
          ],
          achievements: [
            'Improved application performance by 40%',
            'Reduced deployment time from 2 hours to 15 minutes'
          ],
          technologies: ['React', 'Node.js', 'TypeScript', 'AWS', 'Docker']
        },
        {
          title: 'Full Stack Developer',
          company: 'Startup XYZ',
          duration: '2020 - 2022',
          responsibilities: [
            'Developed responsive web applications',
            'Collaborated with design team on UI/UX implementation'
          ],
          technologies: ['Vue.js', 'Python', 'PostgreSQL']
        }
      ],
      education: [
        {
          degree: 'Bachelor of Computer Science',
          school: 'University of Technology',
          year: '2020',
          gpa: '3.8/4.0'
        }
      ],
      skills: {
        technical: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker', 'Git'],
        soft: ['Leadership', 'Problem Solving', 'Communication', 'Teamwork'],
        languages: ['English (Fluent)', 'Vietnamese (Native)']
      },
      projects: [
        {
          name: 'E-commerce Platform',
          description: 'Built a full-stack e-commerce platform with payment integration',
          techStack: ['React', 'Node.js', 'MongoDB', 'Stripe'],
          link: 'https://github.com/test/ecommerce'
        }
      ]
    };

    const pdfBuffer = await this.exportService.exportToPDF(sampleCvData as any, template);
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="test-${template}-template.pdf"`,
    });
    
    res.send(pdfBuffer);
  }
}