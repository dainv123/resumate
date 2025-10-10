import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CvService } from './cv.service';
import { Cv } from './entities/cv.entity';
import { AiService } from '../ai/ai.service';
import { JobDescriptionService } from './job-description.service';
import { UsersService } from '../users/users.service';
import { DocumentParserService } from '../ai/providers/document-parser.service';
import { FileUploadService } from '../../shared/services/file-upload.service';

describe('CvService - New Features', () => {
  let service: CvService;
  let aiService: AiService;
  let cvRepository: Repository<Cv>;

  const mockCv = {
    id: 'test-cv-id',
    userId: 'test-user-id',
    originalFileName: 'test-cv.pdf',
    fileUrl: 'https://s3.test.com/test-cv.pdf',
    parsedData: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '123-456-7890',
      summary: 'Experienced developer',
      skills: {
        technical: ['React', 'TypeScript', 'Node.js'],
        soft: ['Leadership', 'Communication'],
        languages: ['English', 'Spanish'],
        tools: ['Git', 'Docker']
      },
      experience: [
        {
          title: 'Senior Developer',
          company: 'Tech Corp',
          duration: '2020-Present',
          responsibilities: ['Led team', 'Built features']
        }
      ],
      education: []
    },
    version: 1,
    isTailored: false,
  };

  const mockCompatibilityAnalysis = {
    score: 8,
    matchedSkills: ['React', 'TypeScript', 'Node.js'],
    missingSkills: ['AWS', 'Docker', 'Kubernetes'],
    matchedExperience: ['Senior Developer experience', 'Team leadership'],
    missingRequirements: ['Bachelor degree', '5+ years experience'],
    suggestions: [
      'Add AWS certification',
      'Highlight team size',
      'Include metrics'
    ],
    strengths: [
      'Strong React skills',
      'Leadership experience',
      'Modern tech stack'
    ]
  };

  const mockCoverLetter = `Dear Hiring Manager,

I am writing to express my strong interest in the Senior Developer position at your company.

With my extensive experience in React, TypeScript, and Node.js, I believe I would be an excellent fit for this role.

Thank you for your consideration.

Sincerely,
John Doe`;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CvService,
        {
          provide: getRepositoryToken(Cv),
          useValue: {
            findOne: jest.fn().mockResolvedValue(mockCv),
            save: jest.fn().mockImplementation(cv => Promise.resolve(cv)),
            create: jest.fn().mockImplementation(dto => dto),
          },
        },
        {
          provide: AiService,
          useValue: {
            analyzeCompatibility: jest.fn().mockResolvedValue(mockCompatibilityAnalysis),
            generateCoverLetter: jest.fn().mockResolvedValue(mockCoverLetter),
          },
        },
        {
          provide: JobDescriptionService,
          useValue: {},
        },
        {
          provide: UsersService,
          useValue: {},
        },
        {
          provide: DocumentParserService,
          useValue: {},
        },
        {
          provide: FileUploadService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<CvService>(CvService);
    aiService = module.get<AiService>(AiService);
    cvRepository = module.get<Repository<Cv>>(getRepositoryToken(Cv));
  });

  describe('analyzeCompatibility', () => {
    it('should return compatibility analysis', async () => {
      const result = await service.analyzeCompatibility(
        'test-cv-id',
        'test-user-id',
        'Job description text'
      );

      expect(result).toEqual(mockCompatibilityAnalysis);
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(10);
      expect(Array.isArray(result.matchedSkills)).toBe(true);
      expect(Array.isArray(result.missingSkills)).toBe(true);
      expect(Array.isArray(result.suggestions)).toBe(true);
      expect(aiService.analyzeCompatibility).toHaveBeenCalledWith(
        mockCv.parsedData,
        'Job description text'
      );
    });

    it('should include all required fields in analysis', async () => {
      const result = await service.analyzeCompatibility(
        'test-cv-id',
        'test-user-id',
        'Job description'
      );

      expect(result).toHaveProperty('score');
      expect(result).toHaveProperty('matchedSkills');
      expect(result).toHaveProperty('missingSkills');
      expect(result).toHaveProperty('matchedExperience');
      expect(result).toHaveProperty('missingRequirements');
      expect(result).toHaveProperty('suggestions');
      expect(result).toHaveProperty('strengths');
    });

    it('should handle AI service errors gracefully', async () => {
      jest.spyOn(aiService, 'analyzeCompatibility').mockRejectedValueOnce(
        new Error('AI service error')
      );

      const result = await service.analyzeCompatibility(
        'test-cv-id',
        'test-user-id',
        'Job description'
      );

      // Should return fallback analysis
      expect(result).toBeDefined();
      expect(result.score).toBe(5);
    });
  });

  describe('generateCoverLetter', () => {
    it('should generate cover letter', async () => {
      const result = await service.generateCoverLetter(
        'test-cv-id',
        'test-user-id',
        'Job description text'
      );

      expect(result).toHaveProperty('coverLetter');
      expect(result.coverLetter).toBe(mockCoverLetter);
      expect(result.coverLetter.length).toBeGreaterThan(0);
      expect(aiService.generateCoverLetter).toHaveBeenCalledWith(
        mockCv.parsedData,
        'Job description text'
      );
    });

    it('should include candidate name in cover letter', async () => {
      const result = await service.generateCoverLetter(
        'test-cv-id',
        'test-user-id',
        'Job description'
      );

      expect(result.coverLetter).toContain('John Doe');
    });

    it('should handle AI service errors with fallback', async () => {
      jest.spyOn(aiService, 'generateCoverLetter').mockRejectedValueOnce(
        new Error('AI service error')
      );

      const result = await service.generateCoverLetter(
        'test-cv-id',
        'test-user-id',
        'Job description'
      );

      // Should return fallback cover letter
      expect(result.coverLetter).toContain('Dear Hiring Manager');
      expect(result.coverLetter).toContain(mockCv.parsedData.name);
    });
  });

  describe('Integration', () => {
    it('should work end-to-end for compatibility analysis', async () => {
      const jobDesc = `
        We are looking for a Senior React Developer with:
        - 5+ years of React experience
        - TypeScript expertise
        - AWS knowledge
        - Team leadership skills
      `;

      const result = await service.analyzeCompatibility(
        'test-cv-id',
        'test-user-id',
        jobDesc
      );

      expect(result.score).toBeDefined();
      expect(result.matchedSkills.length + result.missingSkills.length).toBeGreaterThan(0);
    });

    it('should work end-to-end for cover letter generation', async () => {
      const jobDesc = `
        Senior React Developer
        We need someone with React and TypeScript experience.
      `;

      const result = await service.generateCoverLetter(
        'test-cv-id',
        'test-user-id',
        jobDesc
      );

      expect(result.coverLetter).toBeTruthy();
      expect(result.coverLetter).toContain('Dear');
      expect(result.coverLetter).toContain('Sincerely');
    });
  });
});

