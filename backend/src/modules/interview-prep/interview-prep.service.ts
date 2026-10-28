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
  JD_DESCRIPTION_PREVIEW_LENGTH,
  PrepPlanStatus,
  QuestionPack,
  READINESS_GATE_THRESHOLD,
} from './constants/interview-prep.constants';
import {
  CreateInterviewPrepDto,
  ResolveJdDto,
  SubmitMockAnswerDto,
  SubmitPostInterviewSurveyDto,
  UpdateStarStoryDto,
} from './dto/interview-prep.dto';
import {
  defaultProcessMap,
  PrepDay,
  ProcessMap,
} from './domain/pass-framework';
import { PlanStarStory, PrepJobDescriptionSummary } from './domain/interview-prep-ai.types';
import { ResolvedJobDescription } from './domain/jd-resolver.types';
import { InterviewPrepPlan } from './entities/interview-prep-plan.entity';
import { InterviewQuestionAssignment } from './entities/interview-question-assignment.entity';
import { QuestionBank } from './entities/question-bank.entity';
import { Cv } from '../cv/entities/cv.entity';
import { DailySchedulerService } from './services/daily-scheduler.service';
import { ImpactScoringService } from './services/impact-scoring.service';
import { QuestionSelectorService } from './services/question-selector.service';
import { ReadinessService } from './services/readiness.service';
import { SpacedRepetitionService } from './services/spaced-repetition.service';
import { CheatSheetExportService } from './services/cheat-sheet-export.service';
import { InterviewPrepAnalyticsService } from './services/interview-prep-analytics.service';
import { InterviewPrepAnalyticsEvent } from './constants/interview-prep-analytics.constants';
import { JdUrlResolverService } from './services/jd-url-resolver.service';
import { asStringArray } from '../ai/normalize-compatibility';

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
    private jdUrlResolverService: JdUrlResolverService,
  ) {}

  async resolveJobDescription(
    userId: string,
    dto: ResolveJdDto,
  ): Promise<ResolvedJobDescription> {
    const resolved = await this.jdUrlResolverService.resolve(dto.url);
    this.analyticsService.track(
      userId,
      InterviewPrepAnalyticsEvent.JD_RESOLVED,
      undefined,
      { sourceType: resolved.sourceType },
    );
    return resolved;
  }

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

    const questionPack = dto.questionPack ?? QuestionPack.STANDARD;
    if (questionPack === QuestionPack.FAANG) {
      const packUser = await this.usersService.findById(userId);
      if (packUser.plan !== UserPlan.PRO) {
        throw new BadRequestException('FAANG question pack requires Pro plan');
      }
    }

    let jdText = dto.jobDescription.trim();
    let jdSource: Partial<ResolvedJobDescription> | undefined;

    if (this.jdUrlResolverService.isUrl(jdText)) {
      const resolved = await this.jdUrlResolverService.resolve(jdText);
      jdText = resolved.description;
      jdSource = resolved;
    }

    const jobDesc = await this.findOrCreateJobDescription(
      userId,
      jdText,
      jdSource,
    );

    const lang = dto.language ?? 'en';
    const companyName = jobDesc.company ?? jdSource?.company ?? '';

    const [
      compatibility,
      processMapRaw,
      starStories,
      projectDefenses,
      companyResearchRaw,
    ] = await Promise.all([
      this.aiService.analyzeCompatibility(cv.parsedData, jdText, lang),
      this.aiService.inferInterviewProcess(jdText, lang),
      this.aiService.generateStarStories(cv.parsedData, jdText, lang),
      this.aiService.generateProjectDefenseSheets(cv.parsedData, jdText, lang),
      this.aiService.generateCompanyResearch(
        jdText,
        jobDesc.title,
        companyName,
        lang,
      ),
    ]);

    const companyResearch = {
      sections: (companyResearchRaw.sections ?? []).map((section) => ({
        ...section,
        checked: false,
      })),
      generatedAt: new Date().toISOString(),
    };

    const processMap = this.normalizeProcessMap(processMapRaw);

    const jdSkills = this.impactScoringService.extractSkillsFromText(jdText);
    const matchedSkills = asStringArray(compatibility.matchedSkills);
    const missingSkills = asStringArray(compatibility.missingSkills);
    const jdKeywords = this.impactScoringService.countJdMentions(
      jdText,
      jdSkills.length > 0 ? jdSkills : [...matchedSkills, ...missingSkills],
    );

    const gaps = this.impactScoringService.scoreGaps(jdKeywords, {
      matchedSkills,
      missingSkills,
    });

    const questions = await this.questionSelectorService.selectFromBank(
      jdText,
      gaps,
      { pack: questionPack },
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
      companyResearch,
      questionPack,
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
      userId,
      jobDesc,
      cv,
    );
  }

  async listPlans(userId: string): Promise<Record<string, unknown>[]> {
    const plans = await this.planRepository.find({
      where: { userId },
      relations: ['jobDescription', 'cv'],
      order: { createdAt: 'DESC' },
    });

    return plans.map((plan) => this.formatPlanSummary(plan));
  }

  async deletePlan(userId: string, planId: string): Promise<void> {
    const plan = await this.getPlanEntity(userId, planId);
    await this.assignmentRepository.delete({ planId: plan.id });
    await this.planRepository.remove(plan);
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
      userId,
      plan.jobDescription,
      plan.cv,
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

    const plan = await this.getPlanEntity(userId, planId);

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
      dto.language,
      {
        jobDescription: plan.jobDescription?.description ?? '',
        category: question.category,
      },
    );

    assignment.userAnswer = dto.answer;
    assignment.mockScores = [
      ...(assignment.mockScores ?? []),
      {
        score: evaluation.score,
        feedback: evaluation.feedback,
        matchedCriteria: evaluation.matchedCriteria,
        missingCriteria: evaluation.missingCriteria,
        improvedAnswerOutline: evaluation.improvedAnswerOutline,
        followUpQuestion: evaluation.followUpQuestion,
        attemptedAt: new Date().toISOString(),
      },
    ];
    assignment.status =
      evaluation.score >= 7
        ? AssignmentStatus.MASTERED
        : AssignmentStatus.PRACTICED;

    await this.assignmentRepository.save(assignment);
    await this.usersService.incrementUsage(userId, 'mockDrills');

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

  async updateCompanyResearchSection(
    userId: string,
    planId: string,
    sectionId: string,
    checked: boolean,
  ): Promise<Record<string, unknown>> {
    const plan = await this.getPlanEntity(userId, planId);
    const brief = plan.companyResearch as {
      sections?: Array<{ id: string; checked?: boolean }>;
      generatedAt?: string;
    } | null;

    if (!brief?.sections?.length) {
      throw new NotFoundException('Company research not found on this plan');
    }

    const section = brief.sections.find((s) => s.id === sectionId);
    if (!section) {
      throw new NotFoundException('Company research section not found');
    }

    section.checked = checked;
    plan.companyResearch = brief as Record<string, unknown>;
    await this.planRepository.save(plan);

    return this.saveAndFormat(plan, userId);
  }

  async submitPostInterviewSurvey(
    userId: string,
    planId: string,
    dto: SubmitPostInterviewSurveyDto,
  ): Promise<Record<string, unknown>> {
    const plan = await this.getPlanEntity(userId, planId);

    plan.postInterviewSurvey = {
      outcome: dto.outcome,
      difficulty: dto.difficulty,
      notes: dto.notes,
      submittedAt: new Date().toISOString(),
    };
    await this.planRepository.save(plan);

    this.analyticsService.track(
      userId,
      InterviewPrepAnalyticsEvent.SURVEY_SUBMITTED,
      planId,
      { outcome: dto.outcome, difficulty: dto.difficulty },
    );

    return this.saveAndFormat(plan, userId);
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
      ...(await this.formatPlanResponse(
        plan,
        assignments,
        [],
        null,
        readiness,
        user.plan,
        userId,
        plan.jobDescription,
        plan.cv,
      )),
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
      relations: ['jobDescription', 'cv'],
    });
    if (!plan) {
      throw new NotFoundException('Interview prep plan not found');
    }
    return plan;
  }

  private async findOrCreateJobDescription(
    userId: string,
    description: string,
    source?: Partial<ResolvedJobDescription>,
  ): Promise<JobDescription> {
    const existing = source?.sourceUrl
      ? await this.jobDescriptionRepository.findOne({
          where: { userId, sourceUrl: source.sourceUrl },
        })
      : await this.jobDescriptionRepository.findOne({
          where: { userId, description },
        });
    if (existing) return existing;

    const title = source?.title ?? this.extractTitleFromJd(description);
    const company = source?.company ?? this.extractCompanyFromJd(description);

    const jobDescription = this.jobDescriptionRepository.create({
      userId,
      title,
      description,
      company,
      location: source?.location,
      sourceUrl: source?.sourceUrl,
      sourceType: source?.sourceType ?? JobDescriptionSourceType.MANUAL,
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

  private async formatPlanResponse(
    plan: InterviewPrepPlan,
    assignments: InterviewQuestionAssignment[],
    gaps: ReturnType<ImpactScoringService['scoreGaps']>,
    compatibility: Awaited<
      ReturnType<AiService['analyzeCompatibility']>
    > | null,
    readiness: ReturnType<ReadinessService['calculate']>,
    userPlan: UserPlan,
    userId: string,
    jobDescription?: JobDescription | null,
    cv?: Cv | null,
  ): Promise<Record<string, unknown>> {
    const isPro = userPlan === UserPlan.PRO;
    const canMock = await this.usersService.checkUserLimit(userId, 'mockDrills');
    const visibleLimit = INTERVIEW_PREP_LIMITS.free.visibleQuestions;
    const totalQuestions = assignments.length;
    const visibleAssignments = isPro
      ? assignments
      : assignments.slice(0, visibleLimit);
    const jd = jobDescription ?? plan.jobDescription;
    const linkedCv = cv ?? plan.cv;

    const questionIds = visibleAssignments.map((a) => a.questionId);
    const questions = questionIds.length
      ? await this.questionBankRepository.find({
          where: { id: In(questionIds) },
        })
      : [];
    const questionsById = new Map(questions.map((q) => [q.id, q]));

    const enrichedAssignments = visibleAssignments.map((a) => {
      const q = questionsById.get(a.questionId);
      return {
        id: a.id,
        planId: a.planId,
        questionId: a.questionId,
        question: q?.question,
        category: q?.category,
        prepTimeMinutes: q?.prepTimeMinutes,
        priority: a.priority,
        impactScore: a.impactScore,
        userAnswer: a.userAnswer,
        status: a.status,
        mockScores: a.mockScores,
        hints: q
          ? {
              sampleAnswerOutline: q.sampleAnswerOutline,
              followUpQuestions: q.followUpQuestions,
            }
          : undefined,
      };
    });

    return {
      id: plan.id,
      userId: plan.userId,
      jobDescriptionId: plan.jobDescriptionId,
      cvId: plan.cvId,
      jobDescription: jd
        ? this.mapJobDescriptionSummary(jd, true)
        : undefined,
      cvName: linkedCv?.originalFileName,
      interviewDate: plan.interviewDate,
      dailyCapacityMinutes: plan.dailyCapacityMinutes,
      processMap: plan.processMap,
      roadmap: plan.roadmap,
      starStories: plan.starStories ?? [],
      projectDefenses: plan.projectDefenses ?? [],
      companyResearch: plan.companyResearch,
      postInterviewSurvey: plan.postInterviewSurvey,
      questionPack: plan.questionPack,
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
        mockDrillsEnabled: canMock,
        cheatSheetExportEnabled: isPro,
      },
      status: plan.status,
      gaps,
      compatibility,
      questionAssignments: enrichedAssignments,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
    };
  }

  private formatPlanSummary(plan: InterviewPrepPlan): Record<string, unknown> {
    return {
      id: plan.id,
      userId: plan.userId,
      jobDescriptionId: plan.jobDescriptionId,
      cvId: plan.cvId,
      interviewDate: plan.interviewDate,
      dailyCapacityMinutes: plan.dailyCapacityMinutes,
      readinessScore: plan.readinessScore,
      status: plan.status,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
      jobDescription: plan.jobDescription
        ? this.mapJobDescriptionSummary(plan.jobDescription)
        : undefined,
      cvName: plan.cv?.originalFileName,
    };
  }

  private mapJobDescriptionSummary(
    jd: JobDescription,
    includeFullDescription = false,
  ): PrepJobDescriptionSummary {
    const preview =
      jd.description.length <= JD_DESCRIPTION_PREVIEW_LENGTH
        ? jd.description
        : `${jd.description.slice(0, JD_DESCRIPTION_PREVIEW_LENGTH).trim()}…`;

    return {
      id: jd.id,
      title: jd.title,
      company: jd.company ?? undefined,
      preview,
      sourceUrl: jd.sourceUrl ?? undefined,
      sourceType: jd.sourceType ?? undefined,
      ...(includeFullDescription ? { description: jd.description } : {}),
    };
  }
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}
