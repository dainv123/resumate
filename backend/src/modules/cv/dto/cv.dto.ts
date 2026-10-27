import { IsString, IsOptional, IsBoolean } from 'class-validator';
import type { CVData } from '../../../shared/interfaces/cv-data.interface';

export class CreateCvDto {
  @IsString()
  originalFileName: string;

  @IsOptional()
  @IsString()
  fileUrl?: string;

  @IsOptional()
  parsedData?: CVData;
}

export class UpdateCvDto {
  @IsOptional()
  parsedData?: CVData;

  @IsOptional()
  @IsBoolean()
  isTailored?: boolean;

  @IsOptional()
  @IsString()
  tailoredForJob?: string;
}

export class TailorCvDto {
  @IsString()
  jobDescription: string;

  @IsOptional()
  @IsString()
  language?: string;
}

export class QuickBuildCvDto {
  @IsString()
  name: string;

  @IsString()
  email: string;

  @IsString()
  targetRole: string;

  @IsString()
  jobDescription: string;

  @IsOptional()
  @IsString()
  template?: string;

  @IsOptional()
  @IsString()
  language?: string;
}

export class CvResponseDto {
  id: string;
  userId: string;
  originalFileName: string;
  fileUrl: string;
  parsedData: CVData;
  version: number;
  isTailored: boolean;
  tailoredForJob?: string;
  createdAt: Date;
  updatedAt: Date;
}
