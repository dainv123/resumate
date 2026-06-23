import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { InterviewPrepService } from './interview-prep.service';
import { InterviewPrepPlan } from './entities/interview-prep-plan.entity';
import { InterviewQuestionAssignment } from './entities/interview-question-assignment.entity';
import { QuestionBank } from './entities/question-bank.entity';
import { JobDescription } from '../cv/entities/job-description.entity';
import { CvService } from '../cv/cv.service';
import { AiService } from '../ai/ai.service';
import { UsersService } from '../users/users.service';
import { ImpactScoringService } from './services/impact-scoring.service';
import { QuestionSelectorService } from './services/question-selector.service';
import { DailySchedulerService } from './services/daily-scheduler.service';
import { ReadinessService } from './services/readiness.service';
import { SpacedRepetitionService } from './services/spaced-repetition.service';
import { CheatSheetExportService } from './services/cheat-sheet-export.service';
import { InterviewPrepAnalyticsService } from './services/interview-prep-analytics.service';
import { JdUrlResolverService } from './services/jd-url-resolver.service';
import { PrepPlanStatus } from './constants/interview-prep.constants';
import { UserPlan } from '../users/entities/user.entity';

describe('InterviewPrepService', () => {
  let service: InterviewPrepService;

  const mockCv = {
    id: 'cv-1',
    userId: 'user-1',
    parsedData: {
      contact: { name: 'Jane', email: 'j@x.com', phone: '', address: '' },
      summary: 'Engineer',
      skills: { technical: ['React'], soft: [], languages: [], tools: [] },
      experience: [],
      education: [],
      projects: [],
    },
  };

  const mockCompatibility = {
    score: 7,
    matchedSkills: ['React'],
    missingSkills: ['AWS'],
    matchedExperience: [],
    missingRequirements: [],
    suggestions: [],
    strengths: [],
  };

  const mockQuestions = [
    {
      questionId: 'fe-react-hooks-002',
      question: 'Explain useEffect',
      category: 'technical',
      impactScore: 2,
      priority: 'P1' as const,
      prepTimeMinutes: 20,
    },
  ];

  const mockRoadmap = [
    {
      dayIndex: 0,
      daysUntilInterview: 7,
      date: '2026-06-22',
      theme: 'Research',
      tasks: [
        {
          id: 'research-0',
          type: 'company_research',
          title: 'Research company',
          durationMinutes: 45,
          priority: 'P1' as const,
          impactScore: 2.5,
          done: false,
        },
      ],
    },
  ];

  const planRepo = {
    create: jest.fn((data) => ({ id: 'plan-1', ...data })),
    save: jest.fn((data) => Promise.resolve(data)),
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const assignmentRepo = {
    create: jest.fn((data) => data),
    save: jest.fn((items) => Promise.resolve(items)),
    find: jest.fn().mockResolvedValue([]),
  };

  const jobDescRepo = {
    findOne: jest.fn().mockResolvedValue(null),
    create: jest.fn((data) => ({ id: 'jd-1', ...data })),
    save: jest.fn((data) => Promise.resolve(data)),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InterviewPrepService,
        ImpactScoringService,
        DailySchedulerService,
        ReadinessService,
        {
          provide: getRepositoryToken(InterviewPrepPlan),
          useValue: planRepo,
        },
        {
          provide: getRepositoryToken(InterviewQuestionAssignment),
          useValue: assignmentRepo,
        },
        {
          provide: getRepositoryToken(QuestionBank),
          useValue: { findOne: jest.fn(), find: jest.fn().mockResolvedValue([]) },
        },
        {
          provide: getRepositoryToken(JobDescription),
          useValue: jobDescRepo,
        },
        {
          provide: CvService,
          useValue: { getCvById: jest.fn().mockResolvedValue(mockCv) },
        },
        {
          provide: AiService,
          useValue: {
            analyzeCompatibility: jest.fn().mockResolvedValue(mockCompatibility),
            inferInterviewProcess: jest.fn().mockResolvedValue(null),
            generateStarStories: jest.fn().mockResolvedValue([
              {
                id: 'star-1',
                question: 'Tell me about a challenge',
                mapsToQuestions: ['conflict'],
                situation: 'S',
                task: 'T',
                action: 'A',
                result: 'R',
                projectRef: 'Project X',
                ready: false,
              },
            ]),
            generateProjectDefenseSheets: jest.fn().mockResolvedValue([]),
            evaluateMockAnswer: jest.fn(),
            generateCompanyResearch: jest.fn().mockResolvedValue({
              sections: [
                { id: 'mission', title: 'Mission', summary: 'Summary' },
              ],
            }),
          },
        },
        {
          provide: JdUrlResolverService,
          useValue: {
            isUrl: jest.fn().mockReturnValue(false),
            resolve: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            checkUserLimit: jest.fn().mockResolvedValue(true),
            incrementUsage: jest.fn(),
            findById: jest.fn().mockResolvedValue({ plan: UserPlan.FREE }),
          },
        },
        {
          provide: SpacedRepetitionService,
          useValue: {
            injectWeakQuestionRetries: jest.fn((roadmap) => roadmap),
          },
        },
        {
          provide: CheatSheetExportService,
          useValue: { exportToPdf: jest.fn(), buildHtml: jest.fn() },
        },
        {
          provide: InterviewPrepAnalyticsService,
          useValue: { track: jest.fn() },
        },
        {
          provide: QuestionSelectorService,
          useValue: {
            selectFromBank: jest.fn().mockResolvedValue(mockQuestions),
          },
        },
      ],
    }).compile();

    service = module.get(InterviewPrepService);
  });

  it('creates a prep plan with roadmap and assignments', async () => {
    jest
      .spyOn(DailySchedulerService.prototype, 'buildRoadmap')
      .mockReturnValue(mockRoadmap as any);

    const result = await service.createPlan('user-1', {
      jobDescription: 'Senior React Engineer at Acme Corp',
      cvId: 'cv-1',
      interviewDate: '2026-06-29',
      dailyCapacityMinutes: 60,
    });

    expect(result.id).toBe('plan-1');
    expect(result.roadmap).toEqual(mockRoadmap);
    expect(result.questionAssignments).toHaveLength(1);
    expect(result.starStories).toHaveLength(1);
    expect(result.compatibility).toEqual(mockCompatibility);
    expect(result.readinessScore).toBeDefined();
    expect(result.readinessGate).toBeDefined();
    expect(result.limits).toBeDefined();
    expect(planRepo.save).toHaveBeenCalled();
    expect(assignmentRepo.save).toHaveBeenCalled();
  });

  it('rejects interview date in the past', async () => {
    await expect(
      service.createPlan('user-1', {
        jobDescription: 'Engineer role',
        cvId: 'cv-1',
        interviewDate: '2020-01-01',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('updates task status and recalculates readiness', async () => {
    const plan = {
      id: 'plan-1',
      userId: 'user-1',
      cvId: 'cv-1',
      jobDescriptionId: 'jd-1',
      roadmap: mockRoadmap,
      starStories: [],
      readinessBreakdown: {
        compatibility: 70,
        questionCoverage: 0,
        starReadiness: 0,
        companyResearch: 0,
        mockPerformance: 0,
      },
      readinessScore: 21,
      status: PrepPlanStatus.ACTIVE,
    };

    planRepo.findOne.mockResolvedValue(plan);

    const result = await service.updateTaskStatus(
      'user-1',
      'plan-1',
      0,
      'research-0',
      true,
    );

    expect(result.roadmap[0].tasks[0].done).toBe(true);
    expect(planRepo.save).toHaveBeenCalled();
  });
});
