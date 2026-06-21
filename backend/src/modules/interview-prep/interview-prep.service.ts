import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { AiService } from '../ai/ai.service';
import { CvService } from '../cv/cv.service';
import { JobDescription } from '../cv/entities/job-description.entity';
import { UsersService } from '../users/users.service';
import { UserPlan } from '../users/entities/user.entity';
import {
  AssignmentStatus,
  INTERVIEW_PREP_LIMITS,
  InterviewRoundType,
  JobDescriptionSourceType,
  PrepPlanStatus,
  READINESS_GATE_THRESHOLD,
} from './constants/interview-prep.constants';
import {
  CreateInterviewPrepDto,
  SubmitMockAnswerDto,
  UpdateStarStoryDto,
} from './dto/interview-prep.dto';
import {
  defaultProcessMap,
  PrepDay,
  ProcessMap,
} from './domain/pass-framework';
import { PlanStarStory } from './domain/interview-prep-ai.types';
import { InterviewPrepPlan } from './entities/interview-prep-plan.entity';
import { InterviewQuestionAssignment } from './entities/interview-question-assignment.entity';
import { QuestionBank } from './entities/question-bank.entity';
import { DailySchedulerService } from './services/daily-scheduler.service';
import { ImpactScoringService } from './services/impact-scoring.service';
import { QuestionSelectorService } from './services/question-selector.service';
import { ReadinessService } from './services/readiness.service';
import { SpacedRepetitionService } from './services/spaced-repetition.service';
import { CheatSheetExportService } from './services/cheat-sheet-export.service';
import { InterviewPrepAnalyticsService } from './services/interview-prep-analytics.service';
import { InterviewPrepAnalyticsEvent } from './constants/interview-prep-analytics.constants';

@Injectable()
export class InterviewPrepService {
  constructor(
    @InjectRepository(InterviewPrepPlan)
    private planRepository: Repository<InterviewPrepPlan>,
    @InjectRepository(InterviewQuestionAssignment)
    private assignmentRepository: Repository<InterviewQuestionAssignment>,
    @InjectRepository(JobDescription)
    private jobDescriptionRepository: Repository<JobDescription>,
    @InjectRepository(QuestionBank)
    private questionBankRepository: Repository<QuestionBank>,
    private cvService: CvService,
    private aiService: AiService,
    private usersService: UsersService,
    private impactScoringService: ImpactScoringService,
    private questionSelectorService: QuestionSelectorService,
    private dailySchedulerService: DailySchedulerService,
    private readinessService: ReadinessService,
    private spacedRepetitionService: SpacedRepetitionService,
    private cheatSheetExportService: CheatSheetExportService,
    private analyticsService: InterviewPrepAnalyticsService,
  ) {}

  async createPlan(
    userId: string,
    dto: CreateInterviewPrepDto,
  ): Promise<Record<string, unknown>> {
    const canCreate = await this.usersService.checkUserLimit(
      userId,
      'interviewPrepPlans',
    );
    if (!canCreate) {
      throw new BadRequestException(
        'Interview prep plan limit reached for your plan',
      );
    }

    const interviewDate = new Date(dto.interviewDate);
    if (interviewDate < startOfDay(new Date())) {
      throw new BadRequestException('Interview date must be today or in the future');
    }

    const cv = await this.cvService.getCvById(dto.cvId, userId);
    const jobDesc = await this.findOrCreateJobDescription(
      userId,
      dto.jobDescription,
    );

    const [
      compatibility,
      processMapRaw,
      starStories,
      projectDefenses,
    ] = await Promise.all([
      this.aiService.analyzeCompatibility(cv.parsedData, dto.jobDescription),
      this.aiService.inferInterviewProcess(dto.jobDescription),
      this.aiService.generateStarStories(cv.parsedData, dto.jobDescription),
      this.aiService.generateProjectDefenseSheets(
        cv.parsedData,
        dto.jobDescription,
      ),
    ]);

    const processMap = this.normalizeProcessMap(processMapRaw);

    const jdSkills = this.impactScoringService.extractSkillsFromText(
      dto.jobDescription,
    );
    const jdKeywords = this.impactScoringService.countJdMentions(
      dto.jobDescription,
      jdSkills.length > 0
        ? jdSkills
        : [...compatibility.matchedSkills, ...compatibility.missingSkills],
    );

    const gaps = this.impactScoringService.scoreGaps(jdKeywords, {
      matchedSkills: compatibility.matchedSkills,
      missingSkills: compatibility.missingSkills,
    });

    const questions = await this.questionSelectorService.selectFromBank(
      dto.jobDescription,
      gaps,
    );

    const roadmap = this.dailySchedulerService.buildRoadmap({
      interviewDate,
      dailyCapacityMinutes: dto.dailyCapacityMinutes ?? 60,
      gaps,
      questions,
      processMap,
    });

    const normalizedStories = this.normalizeStarStories(starStories);

    const readiness = this.readinessService.calculate(
      roadmap,
      [],
      compatibility.score,
      normalizedStories,
    );

    const plan = this.planRepository.create({
      userId,
      jobDescriptionId: jobDesc.id,
      cvId: dto.cvId,
      interviewDate,
      dailyCapacityMinutes: dto.dailyCapacityMinutes ?? 60,
      processMap: processMap as unknown as Record<string, unknown>,
      roadmap: roadmap as unknown as Record<string, unknown>[],
      starStories: normalizedStories,
      projectDefenses,
      readinessScore: readiness.score,
      readinessBreakdown: readiness.breakdown,
      status: PrepPlanStatus.ACTIVE,
    });

    const savedPlan = await this.planRepository.save(plan);

    const assignments = questions.map((q) =>
      this.assignmentRepository.create({
        planId: savedPlan.id,
        questionId: q.questionId,
        priority: q.priority,
        impactScore: q.impactScore,
        status: AssignmentStatus.PENDING,
      }),
    );
    const savedAssignments = await this.assignmentRepository.save(assignments);

    await this.usersService.incrementUsage(userId, 'interviewPrepPlans');

    this.analyticsService.track(
      userId,
      InterviewPrepAnalyticsEvent.PLAN_CREATED,
      savedPlan.id,
      { readinessScore: readiness.score },
    );

    const user = await this.usersService.findById(userId);
    return this.formatPlanResponse(
      savedPlan,
      savedAssignments,
      gaps,
      compatibility,
      readiness,
      user.plan,
    );
  }

  async listPlans(userId: string): Promise<InterviewPrepPlan[]> {
    return this.planRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getPlan(
    userId: string,
    planId: string,
  ): Promise<Record<string, unknown>> {
    const plan = await this.getPlanEntity(userId, planId);
    const assignments = await this.assignmentRepository.find({
      where: { planId },
      order: { impactScore: 'DESC' },
    });

    const roadmap = plan.roadmap as unknown as PrepDay[];
    const readiness = this.readinessService.calculate(
      roadmap,
      assignments,
      this.compatibilityFromBreakdown(plan.readinessBreakdown),
      plan.starStories ?? [],
    );

    if (plan.readinessScore !== readiness.score) {
      plan.readinessScore = readiness.score;
      plan.readinessBreakdown = readiness.breakdown;
      await this.planRepository.save(plan);
    }

    const user = await this.usersService.findById(userId);
    return this.formatPlanResponse(
      plan,
      assignments,
      [],
      null,
      readiness,
      user.plan,
    );
  }

  async updateTaskStatus(
    userId: string,
    planId: string,
    dayIndex: number,
    taskId: string,
    done: boolean,
  ): Promise<Record<string, unknown>> {
    const plan = await this.getPlanEntity(userId, planId);
    const roadmap = plan.roadmap as unknown as PrepDay[];

    const day = roadmap.find((d) => d.dayIndex === dayIndex);
    if (!day) {
      throw new NotFoundException(`Day index ${dayIndex} not found in roadmap`);
    }

    const task = day.tasks.find((t) => t.id === taskId);
    if (!task) {
      throw new NotFoundException(`Task ${taskId} not found`);
    }

    task.done = done;
    plan.roadmap = roadmap as unknown as Record<string, unknown>[];

    if (done) {
      this.analyticsService.track(
        userId,
        InterviewPrepAnalyticsEvent.TASK_COMPLETED,
        planId,
        { dayIndex, taskId, taskType: task.type },
      );
    }

    return this.saveAndFormat(plan, userId);
  }

  async updateStarStory(
    userId: string,
    planId: string,
    storyIndex: number,
    dto: UpdateStarStoryDto,
  ): Promise<Record<string, unknown>> {
    const plan = await this.getPlanEntity(userId, planId);
    const stories = plan.starStories ?? [];

    if (storyIndex < 0 || storyIndex >= stories.length) {
      throw new NotFoundException(`STAR story index ${storyIndex} not found`);
    }

    stories[storyIndex] = {
      ...stories[storyIndex],
      ...dto,
    };
    plan.starStories = stories;

    return this.saveAndFormat(plan, userId);
  }

  async regenerateStarStory(
    userId: string,
    planId: string,
    storyIndex: number,
  ): Promise<Record<string, unknown>> {
    const plan = await this.getPlanEntity(userId, planId);
    const stories = plan.starStories ?? [];

    if (storyIndex < 0 || storyIndex >= stories.length) {
      throw new NotFoundException(`STAR story index ${storyIndex} not found`);
    }

    const cv = await this.cvService.getCvById(plan.cvId, userId);
    const jobDesc = await this.jobDescriptionRepository.findOne({
      where: { id: plan.jobDescriptionId },
    });
    const jdText = jobDesc?.description ?? '';

    const generated = await this.aiService.generateStarStories(
      cv.parsedData,
      jdText,
    );
    const normalized = this.normalizeStarStories(generated);

    if (normalized[0]) {
      stories[storyIndex] = {
        ...normalized[0],
        id: stories[storyIndex].id,
        ready: false,
      };
      plan.starStories = stories;
    }

    return this.saveAndFormat(plan, userId);
  }

  async submitMockAnswer(
    userId: string,
    planId: string,
    dto: SubmitMockAnswerDto,
  ): Promise<Record<string, unknown>> {
    const canMock = await this.usersService.checkUserLimit(userId, 'mockDrills');
    if (!canMock) {
      throw new BadRequestException('Mock drill limit reached for your plan');
    }

    await this.getPlanEntity(userId, planId);

    const assignment = await this.assignmentRepository.findOne({
      where: { id: dto.assignmentId, planId },
    });
    if (!assignment) {
      throw new NotFoundException('Question assignment not found');
    }

    const question = await this.questionBankRepository.findOne({
      where: { id: assignment.questionId },
    });
    if (!question) {
      throw new NotFoundException('Question not found in bank');
    }

    const evaluation = await this.aiService.evaluateMockAnswer(
      question.question,
      question.evaluationRubric,
      dto.answer,
    );

    assignment.userAnswer = dto.answer;
    assignment.mockScores = [
      ...(assignment.mockScores ?? []),
      {
        score: evaluation.score,
        feedback: evaluation.feedback,
        attemptedAt: new Date().toISOString(),
      },
    ];
    assignment.status =
      evaluation.score >= 7
        ? AssignmentStatus.MASTERED
        : AssignmentStatus.PRACTICED;

    await this.assignmentRepository.save(assignment);
    await this.usersService.incrementUsage(userId, 'mockDrills');

    const plan = await this.getPlanEntity(userId, planId);

    if (evaluation.score < 7) {
      const roadmap = plan.roadmap as unknown as PrepDay[];
      plan.roadmap = this.spacedRepetitionService.injectWeakQuestionRetries(
        roadmap,
        [
          {
            questionId: assignment.questionId,
            title: question.question,
            prepTimeMinutes: question.prepTimeMinutes,
          },
        ],
      ) as unknown as Record<string, unknown>[];
      await this.planRepository.save(plan);
    }

    this.analyticsService.track(
      userId,
      InterviewPrepAnalyticsEvent.MOCK_SUBMITTED,
      planId,
      { assignmentId: dto.assignmentId, score: evaluation.score },
    );

    return this.saveAndFormat(plan, userId, {
      mockEvaluation: evaluation,
    });
  }

  async exportCheatSheetPdf(userId: string, planId: string): Promise<Buffer> {
    const user = await this.usersService.findById(userId);
    if (user.plan !== UserPlan.PRO) {
      throw new BadRequestException(
        'Cheat sheet export is available on Pro plan',
      );
    }

    const plan = await this.getPlanEntity(userId, planId);
    const assignments = await this.assignmentRepository.find({
      where: { planId },
      order: { impactScore: 'DESC' },
    });

    const questionIds = assignments.map((a) => a.questionId);
    const bankQuestions = questionIds.length
      ? await this.questionBankRepository.find({
          where: { id: In(questionIds) },
        })
      : [];
    const questionMap = new Map(bankQuestions.map((q) => [q.id, q.question]));

    const pdf = await this.cheatSheetExportService.exportToPdf({
      interviewDate: new Date(plan.interviewDate).toLocaleDateString(),
      readinessScore: Number(plan.readinessScore ?? 0),
      starStories: plan.starStories ?? [],
      projectDefenses: plan.projectDefenses ?? [],
      questions: assignments.map((a) => ({
        priority: a.priority,
        text: questionMap.get(a.questionId) ?? a.questionId,
      })),
      roadmap: plan.roadmap as unknown as PrepDay[],
    });

    this.analyticsService.track(
      userId,
      InterviewPrepAnalyticsEvent.CHEAT_SHEET_EXPORTED,
      planId,
    );

    return pdf;
  }

  private async saveAndFormat(
    plan: InterviewPrepPlan,
    userId: string,
    extra: Record<string, unknown> = {},
  ): Promise<Record<string, unknown>> {
    const assignments = await this.assignmentRepository.find({
      where: { planId: plan.id },
      order: { impactScore: 'DESC' },
    });

    const roadmap = plan.roadmap as unknown as PrepDay[];
    const readiness = this.readinessService.calculate(
      roadmap,
      assignments,
      this.compatibilityFromBreakdown(plan.readinessBreakdown),
      plan.starStories ?? [],
    );

    plan.readinessScore = readiness.score;
    plan.readinessBreakdown = readiness.breakdown;
    await this.planRepository.save(plan);

    const user = await this.usersService.findById(userId);
    return {
      ...this.formatPlanResponse(
        plan,
        assignments,
        [],
        null,
        readiness,
        user.plan,
      ),
      ...extra,
    };
  }

  private normalizeProcessMap(raw: {
    rounds?: Array<{
      type: string;
      label: string;
      durationMinutes: number;
      weight: number;
      focusAreas: string[];
    }>;
    totalEstimatedDays?: number;
  } | null): ProcessMap {
    if (!raw?.rounds?.length) {
      return defaultProcessMap();
    }

    const validRoundTypes = new Set(Object.values(InterviewRoundType));

    return {
      rounds: raw.rounds.map((round) => ({
        type: validRoundTypes.has(round.type as InterviewRoundType)
          ? (round.type as InterviewRoundType)
          : InterviewRoundType.TECHNICAL,
        label: round.label,
        durationMinutes: round.durationMinutes,
        weight: round.weight,
        focusAreas: round.focusAreas,
      })),
      totalEstimatedDays: raw.totalEstimatedDays ?? 7,
    };
  }

  private normalizeStarStories(stories: PlanStarStory[]): PlanStarStory[] {
    return stories.map((story, index) => ({
      id: story.id || `star-${index + 1}`,
      question: story.question,
      mapsToQuestions: story.mapsToQuestions ?? [],
      situation: story.situation,
      task: story.task,
      action: story.action,
      result: story.result,
      projectRef: story.projectRef,
      ready: story.ready ?? false,
    }));
  }

  private async getPlanEntity(
    userId: string,
    planId: string,
  ): Promise<InterviewPrepPlan> {
    const plan = await this.planRepository.findOne({
      where: { id: planId, userId },
    });
    if (!plan) {
      throw new NotFoundException('Interview prep plan not found');
    }
    return plan;
  }

  private async findOrCreateJobDescription(
    userId: string,
    description: string,
  ): Promise<JobDescription> {
    const existing = await this.jobDescriptionRepository.findOne({
      where: { userId, description },
    });
    if (existing) return existing;

    const title = this.extractTitleFromJd(description);
    const company = this.extractCompanyFromJd(description);

    const jobDescription = this.jobDescriptionRepository.create({
      userId,
      title,
      description,
      company,
      sourceType: JobDescriptionSourceType.MANUAL,
      requirements: {
        skills: this.impactScoringService.extractSkillsFromText(description),
        education: [],
        experience: [],
        certifications: [],
      },
      keywords: this.impactScoringService.extractSkillsFromText(description),
    });

    return this.jobDescriptionRepository.save(jobDescription);
  }

  private extractTitleFromJd(text: string): string {
    const firstLine = text.split('\n').find((l) => l.trim().length > 0) ?? '';
    if (firstLine.length <= 120) return firstLine.trim();
    return firstLine.slice(0, 117).trim() + '...';
  }

  private extractCompanyFromJd(text: string): string | undefined {
    const match = text.match(/(?:at|@|company:)\s*([A-Z][A-Za-z0-9\s&.]+)/i);
    return match?.[1]?.trim();
  }

  private compatibilityFromBreakdown(
    breakdown: InterviewPrepPlan['readinessBreakdown'],
  ): number {
    if (!breakdown) return 5;
    return (breakdown.compatibility / 100) * 10;
  }

  private formatPlanResponse(
    plan: InterviewPrepPlan,
    assignments: InterviewQuestionAssignment[],
    gaps: ReturnType<ImpactScoringService['scoreGaps']>,
    compatibility: Awaited<
      ReturnType<AiService['analyzeCompatibility']>
    > | null,
    readiness: ReturnType<ReadinessService['calculate']>,
    userPlan: UserPlan,
  ): Record<string, unknown> {
    const isPro = userPlan === UserPlan.PRO;
    const visibleLimit = INTERVIEW_PREP_LIMITS.free.visibleQuestions;
    const totalQuestions = assignments.length;
    const visibleAssignments = isPro
      ? assignments
      : assignments.slice(0, visibleLimit);

    return {
      id: plan.id,
      userId: plan.userId,
      jobDescriptionId: plan.jobDescriptionId,
      cvId: plan.cvId,
      interviewDate: plan.interviewDate,
      dailyCapacityMinutes: plan.dailyCapacityMinutes,
      processMap: plan.processMap,
      roadmap: plan.roadmap,
      starStories: plan.starStories ?? [],
      projectDefenses: plan.projectDefenses ?? [],
      readinessScore: plan.readinessScore,
      readinessBreakdown: plan.readinessBreakdown,
      isReady: readiness.isReady,
      nextActions: readiness.nextActions,
      readinessGate: {
        threshold: READINESS_GATE_THRESHOLD,
        isReady: readiness.isReady,
        pointsToGo: Math.max(0, READINESS_GATE_THRESHOLD - readiness.score),
        nextActions: readiness.nextActions,
      },
      limits: {
        plan: userPlan,
        totalQuestions,
        visibleQuestions: visibleAssignments.length,
        lockedQuestionCount: isPro
          ? 0
          : Math.max(0, totalQuestions - visibleLimit),
        mockDrillsEnabled: isPro,
        cheatSheetExportEnabled: isPro,
      },
      status: plan.status,
      gaps,
      compatibility,
      questionAssignments: visibleAssignments,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
    };
  }
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}
