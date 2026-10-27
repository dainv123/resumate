import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import type { Language } from '../../ai/translations/ai-prompts';
import {
  DEFAULT_DAILY_CAPACITY_MINUTES,
  QuestionPack,
} from '../constants/interview-prep.constants';

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
  @IsIn(['en', 'vi'])
  language?: Language;

  @IsOptional()
  @IsIn([QuestionPack.STANDARD, QuestionPack.FAANG])
  questionPack?: QuestionPack;
}

export class ResolveJdDto {
  @IsString()
  url: string;
}

export class UpdateCompanyResearchSectionDto {
  @IsBoolean()
  checked: boolean;
}

export class SubmitPostInterviewSurveyDto {
  @IsIn(['passed', 'failed', 'waiting', 'declined'])
  outcome: 'passed' | 'failed' | 'waiting' | 'declined';

  @IsInt()
  @Min(1)
  @Max(5)
  difficulty: number;

  @IsOptional()
  @IsString()
  notes?: string;
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

  @IsOptional()
  @IsIn(['en', 'vi'])
  language?: Language;
}
