import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PortfolioController } from './portfolio.controller';
import { PortfolioService } from './portfolio.service';
import { TemplateLoaderService } from './templates/template-loader.service';
import { Portfolio } from './entities/portfolio.entity';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { CvModule } from '../cv/cv.module';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Portfolio]),
    AuthModule,
    UsersModule,
    CvModule,
    ProjectsModule
  ],
  controllers: [PortfolioController],
  providers: [PortfolioService, TemplateLoaderService],
  exports: [PortfolioService],
})
export class PortfolioModule {}