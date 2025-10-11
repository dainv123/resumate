import { IsString, IsBoolean, IsOptional, IsObject } from 'class-validator';
import type { TemplateMetadata } from '../entities/template.entity';

export class CreateTemplateDto {
  @IsString()
  name: string;

  @IsString()
  displayName: string;

  @IsString()
  description: string;

  @IsObject()
  metadata: TemplateMetadata;

  @IsOptional()
  @IsBoolean()
  isPremium?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateTemplateDto {
  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsObject()
  metadata?: TemplateMetadata;

  @IsOptional()
  @IsBoolean()
  isPremium?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

