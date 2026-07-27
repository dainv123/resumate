import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import {
  CreateInterviewPrepDto,
  ResolveJdDto,
  SubmitMockAnswerDto,
  SubmitPostInterviewSurveyDto,
  UpdateCompanyResearchSectionDto,
  UpdatePrepTaskDto,
  UpdateStarStoryDto,
} from './dto/interview-prep.dto';
import { InterviewPrepService } from './interview-prep.service';
import { InterviewPrepEnabledGuard } from './guards/interview-prep-enabled.guard';

@Controller('interview-prep')
@UseGuards(JwtAuthGuard, InterviewPrepEnabledGuard)
export class InterviewPrepController {
  constructor(private interviewPrepService: InterviewPrepService) {}

  @Post()
  async createPlan(
    @GetUser('id') userId: string,
    @Body() dto: CreateInterviewPrepDto,
  ) {
    return this.interviewPrepService.createPlan(userId, dto);
  }

  @Post('resolve-jd')
  async resolveJd(
    @GetUser('id') userId: string,
    @Body() dto: ResolveJdDto,
  ) {
    return this.interviewPrepService.resolveJobDescription(userId, dto);
  }

  @Get()
  async listPlans(@GetUser('id') userId: string) {
    return this.interviewPrepService.listPlans(userId);
  }

  @Get(':id/export/cheat-sheet/pdf')
  async exportCheatSheet(
    @GetUser('id') userId: string,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const pdfBuffer = await this.interviewPrepService.exportCheatSheetPdf(
      userId,
      id,
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="interview-cheat-sheet-${id}.pdf"`,
    });
    res.send(pdfBuffer);
  }

  @Get(':id')
  async getPlan(
    @GetUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.interviewPrepService.getPlan(userId, id);
  }

  @Delete(':id')
  async deletePlan(
    @GetUser('id') userId: string,
    @Param('id') id: string,
  ) {
    await this.interviewPrepService.deletePlan(userId, id);
    return { success: true };
  }

  @Patch(':id/tasks/:dayIndex/:taskId')
  async updateTask(
    @GetUser('id') userId: string,
    @Param('id') id: string,
    @Param('dayIndex', ParseIntPipe) dayIndex: number,
    @Param('taskId') taskId: string,
    @Body() dto: UpdatePrepTaskDto,
  ) {
    return this.interviewPrepService.updateTaskStatus(
      userId,
      id,
      dayIndex,
      taskId,
      dto.done,
    );
  }

  @Patch(':id/star-stories/:storyIndex')
  async updateStarStory(
    @GetUser('id') userId: string,
    @Param('id') id: string,
    @Param('storyIndex', ParseIntPipe) storyIndex: number,
    @Body() dto: UpdateStarStoryDto,
  ) {
    return this.interviewPrepService.updateStarStory(
      userId,
      id,
      storyIndex,
      dto,
    );
  }

  @Post(':id/star-stories/:storyIndex/regenerate')
  async regenerateStarStory(
    @GetUser('id') userId: string,
    @Param('id') id: string,
    @Param('storyIndex', ParseIntPipe) storyIndex: number,
  ) {
    return this.interviewPrepService.regenerateStarStory(
      userId,
      id,
      storyIndex,
    );
  }

  @Post(':id/mock')
  async submitMockAnswer(
    @GetUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: SubmitMockAnswerDto,
  ) {
    return this.interviewPrepService.submitMockAnswer(userId, id, dto);
  }

  @Patch(':id/company-research/:sectionId')
  async updateCompanyResearchSection(
    @GetUser('id') userId: string,
    @Param('id') id: string,
    @Param('sectionId') sectionId: string,
    @Body() dto: UpdateCompanyResearchSectionDto,
  ) {
    return this.interviewPrepService.updateCompanyResearchSection(
      userId,
      id,
      sectionId,
      dto.checked,
    );
  }

  @Post(':id/survey')
  async submitSurvey(
    @GetUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: SubmitPostInterviewSurveyDto,
  ) {
    return this.interviewPrepService.submitPostInterviewSurvey(
      userId,
      id,
      dto,
    );
  }
}
