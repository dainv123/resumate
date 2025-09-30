import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { AiService } from './ai.service';
import { CVData } from '../cv/entities/cv.entity';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('parse-cv')
  async parseCv(@Body() body: { text: string }) {
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
  async tailorCv(@Body() body: { cvData: CVData; jobDescription: string }) {
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