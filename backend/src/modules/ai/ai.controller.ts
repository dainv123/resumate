import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { CVData } from '../../shared/interfaces/cv-data.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { TrackActivity } from '../../common/decorators/track-activity.decorator';
import { ActivityType } from '../../common/enums/activity-type.enum';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('parse-cv')
  @UseGuards(JwtAuthGuard)
  @TrackActivity(ActivityType.AI_FEATURE_USED, {
    getMetadata: (result, context) => ({
      feature: 'parse_cv',
      success: result?.success || false,
      textLength: context.body?.text?.length || 0
    })
  })
  async parseCv(@Body() body: { text: string }, @GetUser('id') userId: string) {
    try {
      const cvData = await this.aiService.parseCvWithRetry(
        Buffer.from(body.text),
        'text/plain'
      );
      return { success: true, data: cvData };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Post('generate-bullets')
  async generateBullets(@Body() body: {
    name: string;
    role: string;
    techStack: string[];
    results?: string;
  }) {
    try {
      const bullets = await this.aiService.generateProjectBullets(body);
      return { success: true, bullets };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Post('tailor-cv')
  @UseGuards(JwtAuthGuard)
  @TrackActivity(ActivityType.AI_FEATURE_USED, {
    getMetadata: (result, context) => ({
      feature: 'tailor_cv',
      success: result?.success || false,
      jobDescriptionLength: context.body?.jobDescription?.length || 0
    })
  })
  async tailorCv(@Body() body: { cvData: CVData; jobDescription: string }, @GetUser('id') userId: string) {
    try {
      const tailoredCv = await this.aiService.tailorCvForJob(
        body.cvData,
        body.jobDescription
      );
      return { success: true, data: tailoredCv };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Post('suggestions')
  async getSuggestions(@Body() body: { cvData: CVData }) {
    try {
      const suggestions = await this.aiService.suggestImprovements(body.cvData);
      return { success: true, suggestions };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Post('extract-keywords')
  async extractKeywords(@Body() body: { jobDescription: string }) {
    try {
      const keywords = await this.aiService.extractJobKeywords(body.jobDescription);
      return { success: true, keywords };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Get('health')
  async healthCheck() {
    return { 
      status: 'healthy', 
      provider: 'Google AI Studio',
      timestamp: new Date().toISOString()
    };
  }
}