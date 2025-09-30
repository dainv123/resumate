import { IsString, IsOptional, IsArray, IsBoolean } from 'class-validator';
import type { CVData } from '../entities/cv.entity';

export class CreateCvDto {
  @IsString()
  originalFileName: string;

  @IsString()
  fileUrl: string;

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