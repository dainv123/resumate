import { IsString, IsArray, IsOptional, IsBoolean } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  name: string;

  @IsString()
  role: string;

  @IsArray()
  @IsString({ each: true })
  techStack: string[];

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  results?: string;

  @IsOptional()
  @IsString()
  demoLink?: string;

  @IsOptional()
  @IsString()
  githubLink?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  techStack?: string[];

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  results?: string;

  @IsOptional()
  @IsString()
  demoLink?: string;

  @IsOptional()
  @IsString()
  githubLink?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsBoolean()
  isAddedToCv?: boolean;
}

export class AddToCvDto {
  @IsString()
  cvId: string;
}