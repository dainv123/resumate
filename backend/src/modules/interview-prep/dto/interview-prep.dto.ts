import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { DEFAULT_DAILY_CAPACITY_MINUTES } from '../constants/interview-prep.constants';

export class CreateInterviewPrepDto {
  @IsString()
  jobDescription: string;

  @IsUUID()
  cvId: string;

  @IsDateString()
  interviewDate: string;

  @IsOptional()
  @IsInt()
  @Min(30)
  @Max(180)
  dailyCapacityMinutes?: number = DEFAULT_DAILY_CAPACITY_MINUTES;

  @IsOptional()
  @IsString()
  language?: string;
}

export class UpdatePrepTaskDto {
  @IsBoolean()
  done: boolean;
}

export class UpdateStarStoryDto {
  @IsOptional()
  @IsString()
  situation?: string;

  @IsOptional()
  @IsString()
  task?: string;

  @IsOptional()
  @IsString()
  action?: string;

  @IsOptional()
  @IsString()
  result?: string;

  @IsOptional()
  @IsBoolean()
  ready?: boolean;
}

export class SubmitMockAnswerDto {
  @IsString()
  assignmentId: string;

  @IsString()
  answer: string;
}
