import { Controller, Post, Get, Put, Body, Param, UseGuards, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PortfolioService } from './portfolio.service';
import { CreatePortfolioDto, UpdatePortfolioDto } from './dto/portfolio.dto';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('portfolio')
export class PortfolioController {
  constructor(private portfolioService: PortfolioService) {}

  @UseGuards(JwtAuthGuard)
  @Post('generate')
  async generatePortfolio(
    @GetUser('id') userId: string,
    @Body() createPortfolioDto: CreatePortfolioDto,
  ) {
    return this.portfolioService.generatePortfolio(userId, createPortfolioDto);
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
    const url = await this.portfolioService.generatePortfolioUrl(userId, body.customDomain);
    return { url };
  }

  @Get(':username')
  async getPortfolioByUsername(@Param('username') username: string) {
    return this.portfolioService.getPortfolioByUsername(username);
  }
}