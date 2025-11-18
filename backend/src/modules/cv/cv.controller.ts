import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Res, Req, UseInterceptors, UploadedFile, Logger, BadRequestException } from '@nestjs/common';
import type { Response, Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';
import { CvService } from './cv.service';
import { CreateCvDto, UpdateCvDto, TailorCvDto, QuickBuildCvDto } from './dto/cv.dto';
import type { CVData, TemplateConfig } from '../../shared/interfaces/cv-data.interface';
import { CVDataUtils } from '../../shared/utils/cv-data.utils';
import { ExportService } from '../../shared/services/export.service';
import { DynamicTemplateService } from '../../shared/services/dynamic-template.service';
import { TrackActivity } from 'src/common/decorators/track-activity.decorator';
import { ActivityType } from 'src/common/enums/activity-type.enum';

@Controller('cv')
@UseGuards(JwtAuthGuard)
export class CvController {
  private readonly logger = new Logger(CvController.name);

  constructor(
    private readonly cvService: CvService,
    private readonly exportService: ExportService,
    private readonly dynamicTemplateService: DynamicTemplateService,
  ) {}

  @Post()
  @TrackActivity(ActivityType.CV_CREATED, {
    getMetadata: (cv) => ({
      fileName: cv.originalFileName,
    }),
  })
  async create(@Body() createCvDto: CreateCvDto, @GetUser() user: User) {
    return this.cvService.createCv(user.id, createCvDto);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @TrackActivity(ActivityType.CV_UPLOADED, {
    getMetadata: (cv) => ({
      fileName: cv.originalFileName,
      fileSize: cv.fileSize,
    }),
  })
  async uploadCv(
    @GetUser('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.cvService.uploadCv(userId, file);
  }

  @Get()
  async findAll(@GetUser() user: User) {
    return this.cvService.getUserCvs(user.id);
  }

  @Get('paginated')
  async findAllPaginated(
    @GetUser() user: User,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search?: string,
    @Query('sortBy') sortBy: string = 'createdAt',
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'DESC'
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    
    return this.cvService.getUserCvsPaginated(user.id, {
      page: pageNum,
      limit: limitNum,
      search,
      sortBy,
      sortOrder
    });
  }

  @Get(':id')
  @TrackActivity(ActivityType.CV_VIEWED, {
    getResourceId: (_result, context) => context.params.id,
    getMetadata: (result) => ({
      fileName: result?.originalFileName,
    }),
  })
  async findOne(@Param('id') id: string, @GetUser() user: User) {
    return this.cvService.getCvById(id, user.id);
  }

  /**
   * Get CV with all related data (job description, analysis, cover letter)
   */
  @Get(':id/full')
  async getCvWithRelatedData(@Param('id') id: string, @GetUser() user: User) {
    return this.cvService.getCvWithRelatedData(id, user.id);
  }

  @Put(':id')
  @TrackActivity(ActivityType.CV_UPDATED, {
    getMetadata: (cv) => ({
      fileName: cv.originalFileName,
    }),
  })
  async update(
    @Param('id') id: string,
    @Body() updateCvDto: UpdateCvDto,
    @GetUser() user: User,
  ) {
    return this.cvService.updateCv(id, user.id, updateCvDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @GetUser() user: User) {
    return this.cvService.deleteCv(id, user.id);
  }

  @Post(':id/tailor')
  @TrackActivity(ActivityType.CV_TAILORED, {
    getMetadata: (cv) => ({
      fileName: cv.originalFileName,
      isTailored: cv.isTailored,
    }),
  })
  async tailorCv(
    @Param('id') id: string,
    @Body() tailorCvDto: TailorCvDto,
    @GetUser() user: User,
  ) {
    return this.cvService.tailorCv(id, user.id, tailorCvDto.jobDescription);
  }

  @Post(':id/duplicate')
  @TrackActivity(ActivityType.CV_CREATED, {
    getMetadata: (cv) => ({
      fileName: cv.originalFileName,
      duplicatedFrom: cv.originalCvId,
    }),
  })
  async duplicateCv(
    @Param('id') id: string,
    @GetUser('id') userId: string,
  ) {
    const duplicatedCv = await this.cvService.duplicateCv(id, userId);
    return duplicatedCv;
  }

  @Post(':id/restore/:version')
  @TrackActivity(ActivityType.CV_UPDATED, {
    getMetadata: (cv, context) => ({
      fileName: cv.originalFileName,
      restoredVersion: context.params.version,
    }),
  })
  async restoreVersion(
    @Param('id') id: string,
    @Param('version') version: string,
    @GetUser('id') userId: string,
  ) {
    const restoredCv = await this.cvService.restoreVersion(id, userId, parseInt(version));
    return restoredCv;
  }

  @Post(':id/analyze-compatibility')
  async analyzeCompatibility(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @Body() body: { jobDescription: string, jobTitle?: string, company?: string },
  ) {
    // Generate analysis (will reuse if JobDescription exists)
    const analysis = await this.cvService.analyzeCompatibility(id, userId, body.jobDescription);
    
    return {
      ...analysis,
      reused: (analysis as any).reused || false, // Add flag to indicate if reused
    };
  }

  @Post(':id/generate-cover-letter')
  async generateCoverLetter(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @Body() body: { jobDescription: string, jobTitle?: string, company?: string },
  ) {
    // Generate cover letter (will reuse if JobDescription exists)
    const result = await this.cvService.generateCoverLetter(id, userId, body.jobDescription);
    
    return {
      ...result,
      reused: (result as any).reused || false, // Add flag to indicate if reused
    };
  }

  @Post('quick-build')
  @TrackActivity(ActivityType.CV_CREATED, {
    getMetadata: (cv) => ({
      fileName: cv.originalFileName,
      template: cv.parsedData?.template,
    }),
  })
  async quickBuildCv(
    @Body() quickBuildCvDto: QuickBuildCvDto,
    @GetUser() user: User,
  ) {
    return this.cvService.quickBuildCv(user.id, quickBuildCvDto);
  }

  /**
   * Export CV to PDF with template support
   */
  @Get(':id/export/pdf')
  @TrackActivity(ActivityType.CV_EXPORTED, {
    getResourceId: (_result, context) => context.params.id,
    getMetadata: (_result, context) => ({
      format: 'pdf',
      template: context.query.template || 'professional',
    }),
  })
  async exportToPDF(
    @Param('id') id: string,
    @Query('template') template: string = 'professional',
    @GetUser() user: User,
    @Res() res: Response,
  ) {
    try {
      const cv = await this.cvService.getCvById(id, user.id);
      if (!cv) {
        return res.status(404).json({ message: 'CV not found' });
      }

      // Normalize CV data to standardized format
      const normalizedCVData = CVDataUtils.normalizeCVData(cv.parsedData);
      const pdfBuffer = await this.cvService.exportToPDF(normalizedCVData, template);
      
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${cv.originalFileName.replace(/\.[^/.]+$/, '')}-${template}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      });

      res.send(pdfBuffer);
    } catch (error) {
      console.error('PDF export error:', error);
      res.status(500).json({ 
        message: 'Failed to export PDF', 
        error: error.message 
      });
    }
  }

  /**
   * Export CV to PDF with custom configuration
   */
  @Post(':id/export/pdf/dynamic')
  @TrackActivity(ActivityType.CV_EXPORTED, {
    getResourceId: (_result, context) => context.params.id,
    getMetadata: () => ({
      format: 'pdf',
      template: 'dynamic',
      hasCustomConfig: true,
    }),
  })
  async exportToPDFWithConfig(
    @Param('id') id: string,
    @Body() templateConfig: TemplateConfig,
    @GetUser() user: User,
    @Res() res: Response,
  ) {
    try {
      const cv = await this.cvService.getCvById(id, user.id);
      if (!cv) {
        return res.status(404).json({ message: 'CV not found' });
      }

      // Normalize CV data to standardized format
      const normalizedCVData = CVDataUtils.normalizeCVData(cv.parsedData);
      const normalizedConfig = this.normalizeTemplateConfig(templateConfig);
      
      const pdfBuffer = await this.cvService.exportToPDFWithConfig(
        normalizedCVData, 
        'dynamic',
        normalizedConfig
      );
      
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${cv.originalFileName.replace(/\.[^/.]+$/, '')}-custom.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      });

      res.send(pdfBuffer);
    } catch (error) {
      console.error('PDF export error:', error);
      res.status(500).json({ 
        message: 'Failed to export PDF', 
        error: error.message 
      });
    }
  }

  /**
   * Export CV to Word document
   */
  @Get(':id/export/word')
  @TrackActivity(ActivityType.CV_EXPORTED, {
    getResourceId: (_result, context) => context.params.id,
    getMetadata: () => ({
      format: 'word',
    }),
  })
  async exportToWord(
    @Param('id') id: string,
    @GetUser() user: User,
    @Res() res: Response,
  ) {
    try {
      const cv = await this.cvService.getCvById(id, user.id);
      if (!cv) {
        return res.status(404).json({ message: 'CV not found' });
      }

      // Normalize CV data
      const normalizedCVData = CVDataUtils.normalizeCVData(cv.parsedData);
      
      const wordBuffer = await this.cvService.exportToWord(normalizedCVData);
      
      res.set({
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${cv.originalFileName.replace(/\.[^/.]+$/, '')}.docx"`,
        'Content-Length': wordBuffer.length.toString(),
      });

      res.send(wordBuffer);
    } catch (error) {
      console.error('Word export error:', error);
      res.status(500).json({ 
        message: 'Failed to export Word document', 
        error: error.message 
      });
    }
  }

  /**
   * Export CV to ATS-friendly format
   */
  @Get(':id/export/ats')
  @TrackActivity(ActivityType.CV_EXPORTED, {
    getResourceId: (_result, context) => context.params.id,
    getMetadata: () => ({
      format: 'ats',
    }),
  })
  async exportToATS(
    @Param('id') id: string,
    @GetUser() user: User,
    @Res() res: Response,
  ) {
    try {
      const cv = await this.cvService.getCvById(id, user.id);
      if (!cv) {
        return res.status(404).json({ message: 'CV not found' });
      }

      // Normalize CV data
      const normalizedCVData = CVDataUtils.normalizeCVData(cv.parsedData);
      
      const atsBuffer = await this.cvService.exportToATS(normalizedCVData);
      
      res.set({
        'Content-Type': 'text/plain',
        'Content-Disposition': `attachment; filename="${cv.originalFileName.replace(/\.[^/.]+$/, '')}-ats.txt"`,
        'Content-Length': atsBuffer.length.toString(),
      });

      res.send(atsBuffer);
    } catch (error) {
      console.error('ATS export error:', error);
      res.status(500).json({ 
        message: 'Failed to export ATS format', 
        error: error.message 
      });
    }
  }

  /**
   * Get all analyses for user
   */
  @Get('analyses')
  async getUserAnalyses(@GetUser('id') userId: string) {
    return this.cvService.getUserAnalyses(userId);
  }

  /**
   * Get analysis by JobDescription ID
   */
  @Get('analyses/:cvId/job-description/:jobDescriptionId')
  async getAnalysisByJobDescription(
    @Param('cvId') cvId: string,
    @Param('jobDescriptionId') jobDescriptionId: string,
    @GetUser('id') userId: string
  ) {
    return this.cvService.getAnalysisByJobDescription(jobDescriptionId, cvId, userId);
  }

  /**
   * Get all cover letters for user
   */
  @Get('cover-letters')
  async getUserCoverLetters(@GetUser('id') userId: string) {
    return this.cvService.getUserCoverLetters(userId);
  }

  /**
   * Get cover letter by JobDescription ID
   */
  @Get('cover-letters/:cvId/job-description/:jobDescriptionId')
  async getCoverLetterByJobDescription(
    @Param('cvId') cvId: string,
    @Param('jobDescriptionId') jobDescriptionId: string,
    @GetUser('id') userId: string
  ) {
    return this.cvService.getCoverLetterByJobDescription(jobDescriptionId, cvId, userId);
  }

  /**
   * Get available templates
   */
  @Get('templates/available')
  async getAvailableTemplates(@GetUser() user: User) {
    return this.cvService.getAvailableTemplates();
  }

  /**
   * Get cleanup statistics (admin only)
   */
  @Get('admin/cleanup/stats')
  async getCleanupStats(@GetUser() user: User) {
    // TODO: Add admin role check
    return this.cvService.getCleanupStats();
  }

  /**
   * Trigger manual cleanup (admin only)
   */
  @Post('admin/cleanup/manual')
  async triggerManualCleanup(@GetUser() user: User) {
    // TODO: Add admin role check
    return this.cvService.triggerManualCleanup();
  }

  /**
   * Preview CV template
   */
  @Post(':id/preview')
  async previewTemplate(
    @Param('id') id: string,
    @Body() templateConfig: TemplateConfig,
    @GetUser() user: User,
  ) {
    try {
      const cv = await this.cvService.getCvById(id, user.id);
      if (!cv) {
        throw new Error('CV not found');
      }

      // Normalize CV data to standardized format
      const normalizedCVData = CVDataUtils.normalizeCVData(cv.parsedData);
      const normalizedConfig = this.normalizeTemplateConfig(templateConfig);
      
      const htmlPreview = await this.cvService.generateTemplatePreview(
        normalizedCVData, 
        normalizedConfig.template || 'dynamic',
        normalizedConfig
      );
      
      return { html: htmlPreview };
    } catch (error) {
      console.error('Preview error:', error);
      throw error;
    }
  }

  /**
   * Normalize template configuration
   */
  private normalizeTemplateConfig(config: any): TemplateConfig & { template?: string } {
    if (!config || typeof config !== 'object') {
      return CVDataUtils.getDefaultTemplateConfig();
    }

    // Ensure required structure
    const normalized: TemplateConfig & { template?: string } = {
      layout: config.layout || 'single-column',
      sections: {
        contact: config.sections?.contact !== false,
        summary: config.sections?.summary !== false,
        experience: config.sections?.experience !== false,
        education: config.sections?.education !== false,
        skills: config.sections?.skills !== false,
        projects: config.sections?.projects !== false,
        certifications: config.sections?.certifications !== false,
        awards: config.sections?.awards !== false,
        publications: config.sections?.publications !== false,
        volunteer: config.sections?.volunteer !== false,
        languages: config.sections?.languages !== false,
      },
      styling: {
        primaryColor: config.styling?.primaryColor || '#2c3e50',
        secondaryColor: config.styling?.secondaryColor || '#34495e',
        fontFamily: config.styling?.fontFamily || 'Arial, sans-serif',
        fontSize: config.styling?.fontSize || 'medium',
      },
      // template: config.template || 'dynamic',
    };

    return normalized;
  }

}