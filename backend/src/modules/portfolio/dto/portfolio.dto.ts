import { IsString, IsOptional, IsEnum, IsObject, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export enum PortfolioTemplate {
  BASIC = 'basic',
  MODERN = 'modern',
  CREATIVE = 'creative',
  MUHAMMAD_ISMAIL = 'muhammad_ismail',
}

export class CustomSectionsDto {
  @IsOptional()
  @IsBoolean()
  hero?: boolean;

  @IsOptional()
  @IsBoolean()
  about?: boolean;

  @IsOptional()
  @IsBoolean()
  skills?: boolean;

  @IsOptional()
  @IsBoolean()
  experience?: boolean;

  @IsOptional()
  @IsBoolean()
  education?: boolean;

  @IsOptional()
  @IsBoolean()
  projects?: boolean;

  @IsOptional()
  @IsBoolean()
  certifications?: boolean;

  @IsOptional()
  @IsBoolean()
  awards?: boolean;

  @IsOptional()
  @IsBoolean()
  contact?: boolean;
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

  @IsOptional()
  @IsString()
  selectedCvId?: string; // Allow user to select which CV to use for portfolio

  @IsOptional()
  @IsObject()
  @Type(() => CustomSectionsDto)
  customSections?: CustomSectionsDto; // Override template default sections
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

  @IsOptional()
  @IsString()
  selectedCvId?: string;

  @IsOptional()
  @IsObject()
  @Type(() => CustomSectionsDto)
  customSections?: CustomSectionsDto;
}

export interface PortfolioSections {
  hero: boolean;
  about: boolean;
  skills: boolean;
  experience: boolean;
  education: boolean;
  projects: boolean;
  certifications: boolean;
  awards: boolean;
  contact: boolean;
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
    skills?: {
      technical: string[];
      soft: string[];
      languages: string[];
      tools: string[];
    };
    experience?: any[];
    education?: any[];
    certifications?: any[];
    awards?: any[];
  };
  projects?: any[];
  template: PortfolioTemplate;
  customDomain?: string;
  sections: PortfolioSections; // Which sections to display
  selectedCvId?: string;
}