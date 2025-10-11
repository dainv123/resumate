import { Controller, Post, Get, Put, Body, Param, UseGuards, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PortfolioService } from './portfolio.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { CreatePortfolioDto, UpdatePortfolioDto } from './dto/portfolio.dto';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { TrackActivity } from '../../common/decorators/track-activity.decorator';
import { ActivityType } from '../../common/enums/activity-type.enum';
import { getAllTemplateConfigs } from './portfolio.constants';

@Controller('portfolio')
export class PortfolioController {
  constructor(
    private portfolioService: PortfolioService,
    private analyticsService: AnalyticsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('generate')
  @TrackActivity(ActivityType.PORTFOLIO_CREATED, {
    getMetadata: (result, context) => ({
      template: context.body.template
    }),
  })
  async generatePortfolio(
    @GetUser('id') userId: string,
    @Body() createPortfolioDto: CreatePortfolioDto,
  ) {
    return this.portfolioService.generatePortfolio(userId, createPortfolioDto);
  }

  @Get('templates')
  async getTemplates(@GetUser('id') userId?: string) {
    const templates = await this.portfolioService.getTemplates();
    return { templates };
  }

  @Get('templates/:id')
  async getTemplateMetadata(@Param('id') id: string) {
    return this.portfolioService.getTemplateMetadata(id);
  }

  @Post('templates/seed')
  async seedTemplates() {
    await this.portfolioService.seedTemplates();
    return { message: 'Portfolio templates seeded successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('check')
  async checkPortfolio(@GetUser('id') userId: string) {
    const portfolio = await this.portfolioService.getUserPortfolio(userId);
    return { 
      exists: !!portfolio,
      portfolio: portfolio ? {
        url: portfolio.generatedUrl,
        template: portfolio.template,
        updatedAt: portfolio.updatedAt
      } : null
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('save')
  async savePortfolio(
    @GetUser('id') userId: string,
    @Body() createPortfolioDto: CreatePortfolioDto,
  ) {
    const existingPortfolio = await this.portfolioService.getUserPortfolio(userId);
    const portfolio = await this.portfolioService.savePortfolio(userId, createPortfolioDto);
    
    // Track activity only for new portfolios
    if (!existingPortfolio) {
      await this.analyticsService.trackActivity(userId, ActivityType.PORTFOLIO_CREATED, portfolio.id, {
        template: createPortfolioDto.template
      });
    }
    
    return {
      ...portfolio,
      status: 'success',
      message: existingPortfolio 
        ? 'Portfolio updated successfully! Your changes have been saved.' 
        : 'Portfolio created successfully! Your portfolio is now live.',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('html')
  async generatePortfolioHTML(
    @GetUser('id') userId: string,
    @Body() createPortfolioDto: CreatePortfolioDto,
  ) {
    const portfolioData = await this.portfolioService.generatePortfolio(userId, createPortfolioDto);
    const html = await this.portfolioService.generatePortfolioHTML(portfolioData);
    return { html };
  }

  @UseGuards(JwtAuthGuard)
  @Post('url')
  async generatePortfolioUrl(
    @GetUser('id') userId: string,
    @Body() body: { customDomain?: string },
  ) {
    const portfolioUrl = await this.portfolioService.generatePortfolioUrl(userId, body.customDomain);
    const validatedCustomDomain = this.portfolioService.validateCustomDomain(body.customDomain);
    
    return { 
      url: portfolioUrl, // Primary URL where portfolio is hosted
      customDomain: validatedCustomDomain, // User's custom domain (if valid)
      note: validatedCustomDomain 
        ? 'Custom domain requires DNS configuration to point to the backend server.'
        : null
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('preview')
  async previewPortfolio(
    @GetUser('id') userId: string,
    @Body() createPortfolioDto: CreatePortfolioDto,
    @Res() res: Response,
  ) {
    const portfolioData = await this.portfolioService.generatePortfolio(userId, createPortfolioDto);
    const html = await this.portfolioService.generatePortfolioHTML(portfolioData);
    
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  }

  @Get(':username')
  async getPortfolioByUsername(@Param('username') username: string, @Res() res: Response) {
    const portfolioData = await this.portfolioService.getPortfolioByUsername(username);
    const html = await this.portfolioService.generatePortfolioHTML(portfolioData);
    
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  }

  @Get('uuid/:uuid')
  async getPortfolioByUuid(@Param('uuid') uuid: string, @Res() res: Response) {
    const portfolio = await this.portfolioService.getPortfolioByUuid(uuid);
    
    res.setHeader('Content-Type', 'text/html');
    res.send(portfolio.generatedHtml);
  }
}