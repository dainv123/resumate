import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { CvController } from './cv.controller';
import { CvService } from './cv.service';
import { JobDescriptionService } from './job-description.service';
import { Cv } from './entities/cv.entity';
import { JobDescription } from './entities/job-description.entity';
import { AiModule } from '../ai/ai.module';
import { UsersModule } from '../users/users.module';
import { ExportService } from '../../shared/services/export.service';
import { DocumentParserService } from '../ai/providers/document-parser.service';
import { FileUploadService } from '../../shared/services/file-upload.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cv, JobDescription]),
    AiModule,
    UsersModule,
    MulterModule.register({
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  ],
  controllers: [CvController],
  providers: [CvService, JobDescriptionService, ExportService, DocumentParserService, FileUploadService],
  exports: [CvService, TypeOrmModule],
})
export class CvModule {}