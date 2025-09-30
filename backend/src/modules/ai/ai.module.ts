import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { GoogleAIService } from './providers/google-ai.service';
import { DocumentParserService } from './providers/document-parser.service';

@Module({
  imports: [ConfigModule],
  controllers: [AiController],
  providers: [AiService, GoogleAIService, DocumentParserService],
  exports: [AiService],
})
export class AiModule {}