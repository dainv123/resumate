import { IsString, IsOptional, IsEnum } from 'class-validator';

export enum PortfolioTemplate {
  BASIC = 'basic',
  MODERN = 'modern',
  CREATIVE = 'creative',
  MUHAMMAD_ISMAIL = 'muhammad_ismail',
}

export class CreatePortfolioDto {
  @IsEnum(PortfolioTemplate)
  template: PortfolioTemplate;

  @IsOptional()
  @IsString()
  customDomain?: string; // Custom domain for display (e.g., myportfolio.com) - requires DNS setup

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsString()
  linkedinUrl?: string;

  @IsOptional()
  @IsString()
  githubUrl?: string;

  @IsOptional()
  @IsString()
  websiteUrl?: string;
}

export class UpdatePortfolioDto {
  @IsOptional()
  @IsEnum(PortfolioTemplate)
  template?: PortfolioTemplate;

  @IsOptional()
  @IsString()
  customDomain?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsString()
  linkedinUrl?: string;

  @IsOptional()
  @IsString()
  githubUrl?: string;

  @IsOptional()
  @IsString()
  websiteUrl?: string;
}

export class PortfolioData {
  user: {
    name: string;
    email: string;
    avatar?: string;
    bio?: string;
    linkedinUrl?: string;
    githubUrl?: string;
    websiteUrl?: string;
  };
  cv: {
    summary?: string;
    skills: {
      technical: string[];
      soft: string[];
      languages: string[];
      tools: string[];
    };
    experience: any[];
    education: any[];
  };
  projects: any[];
  template: PortfolioTemplate;
  customDomain?: string;
}