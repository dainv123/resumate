import { Module } from '@nestjs/common';
import { PortfolioController } from './portfolio.controller';
import { PortfolioService } from './portfolio.service';
import { UsersModule } from '../users/users.module';
import { CvModule } from '../cv/cv.module';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports: [UsersModule, CvModule, ProjectsModule],
  controllers: [PortfolioController],
  providers: [PortfolioService],
  exports: [PortfolioService],
})
export class PortfolioModule {}