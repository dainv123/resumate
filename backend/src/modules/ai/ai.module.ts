import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { GoogleAIService } from './providers/google-ai.service';
import { OpenRouterService } from './providers/openrouter.service';
import { DocumentParserService } from './providers/document-parser.service';
import { EmbeddingService } from './providers/embedding.service';

@Module({
  imports: [ConfigModule],
  controllers: [AiController],
  providers: [
    AiService,
    GoogleAIService,
    OpenRouterService,
    DocumentParserService,
    EmbeddingService,
  ],
  exports: [AiService, EmbeddingService],
})
export class AiModule {}
