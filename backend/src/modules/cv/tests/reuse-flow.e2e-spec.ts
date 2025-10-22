import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as request from 'supertest';
import { CvModule } from '../cv.module';
import { Cv } from '../entities/cv.entity';
import { JobDescription } from '../entities/job-description.entity';
import { CvMatchingAnalysis } from '../entities/cv-matching-analysis.entity';
import { CvCoverLetter } from '../entities/cv-cover-letter.entity';
import { User } from '../../users/entities/user.entity';

describe('Reuse Flow E2E Tests', () => {
  let app: INestApplication;
  let cvRepository: Repository<Cv>;
  let jobDescriptionRepository: Repository<JobDescription>;
  let analysisRepository: Repository<CvMatchingAnalysis>;
  let coverLetterRepository: Repository<CvCoverLetter>;
  let userRepository: Repository<User>;

  const testUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
  };

  const testCv = {
    id: 'test-cv-id',
    userId: testUser.id,
    originalFileName: 'test-cv.pdf',
    fileUrl: 'https://example.com/test-cv.pdf',
    parsedData: {
      name: 'John Doe',
      email: 'john@example.com',
      experience: [
        {
          company: 'Test Company',
          position: 'Software Engineer',
          duration: '2020-2023',
        },
      ],
      skills: {
        technical: ['JavaScript', 'React', 'Node.js'],
        soft: ['Communication', 'Leadership'],
      },
    },
    version: 1,
    isTailored: false,
  };

  const testJobDescription = 'We are looking for a Senior React Developer with 5+ years of experience in JavaScript, React, and Node.js. The ideal candidate should have strong communication skills and leadership experience.';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [Cv, JobDescription, CvMatchingAnalysis, CvCoverLetter, User],
          synchronize: true,
        }),
        CvModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    cvRepository = moduleFixture.get<Repository<Cv>>('CvRepository');
    jobDescriptionRepository = moduleFixture.get<Repository<JobDescription>>('JobDescriptionRepository');
    analysisRepository = moduleFixture.get<Repository<CvMatchingAnalysis>>('CvMatchingAnalysisRepository');
    coverLetterRepository = moduleFixture.get<Repository<CvCoverLetter>>('CvCoverLetterRepository');
    userRepository = moduleFixture.get<Repository<User>>('UserRepository');

    // Create test user
    await userRepository.save(testUser);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clean up before each test
    await analysisRepository.clear();
    await coverLetterRepository.clear();
    await cvRepository.clear();
    await jobDescriptionRepository.clear();
  });

  describe('Analysis Reuse Flow', () => {
    it('should create new analysis on first request', async () => {
      // Create test CV
      await cvRepository.save(testCv);

      const response = await request(app.getHttpServer())
        .post(`/cv/${testCv.id}/analyze-compatibility`)
        .send({
          jobDescription: testJobDescription,
          jobTitle: 'Senior React Developer',
          company: 'Test Company',
        })
        .expect(201);

      expect(response.body).toHaveProperty('score');
      expect(response.body).toHaveProperty('matchedSkills');
      expect(response.body).toHaveProperty('missingSkills');
      expect(response.body).toHaveProperty('suggestions');
      expect(response.body).toHaveProperty('strengths');
      expect(response.body.reused).toBe(false);

      // Verify analysis was saved
      const analyses = await analysisRepository.find();
      expect(analyses).toHaveLength(1);
      expect(analyses[0].jobDescriptionId).toBeDefined();
      expect(analyses[0].isSnapshot).toBe(false);
    });

    it('should reuse existing analysis on second request with same JD', async () => {
      // Create test CV
      await cvRepository.save(testCv);

      // First request - should create new analysis
      const firstResponse = await request(app.getHttpServer())
        .post(`/cv/${testCv.id}/analyze-compatibility`)
        .send({
          jobDescription: testJobDescription,
          jobTitle: 'Senior React Developer',
          company: 'Test Company',
        })
        .expect(201);

      expect(firstResponse.body.reused).toBe(false);

      // Second request - should reuse existing analysis
      const secondResponse = await request(app.getHttpServer())
        .post(`/cv/${testCv.id}/analyze-compatibility`)
        .send({
          jobDescription: testJobDescription,
          jobTitle: 'Senior React Developer',
          company: 'Test Company',
        })
        .expect(201);

      expect(secondResponse.body.reused).toBe(true);
      expect(secondResponse.body.score).toBe(firstResponse.body.score);

      // Verify only one analysis exists
      const analyses = await analysisRepository.find();
      expect(analyses).toHaveLength(1);
    });

    it('should create new analysis for different job description', async () => {
      // Create test CV
      await cvRepository.save(testCv);

      const differentJobDescription = 'We are looking for a Python Developer with Django experience.';

      // First request
      await request(app.getHttpServer())
        .post(`/cv/${testCv.id}/analyze-compatibility`)
        .send({
          jobDescription: testJobDescription,
          jobTitle: 'Senior React Developer',
          company: 'Test Company',
        })
        .expect(201);

      // Second request with different JD
      const response = await request(app.getHttpServer())
        .post(`/cv/${testCv.id}/analyze-compatibility`)
        .send({
          jobDescription: differentJobDescription,
          jobTitle: 'Python Developer',
          company: 'Different Company',
        })
        .expect(201);

      expect(response.body.reused).toBe(false);

      // Verify two analyses exist
      const analyses = await analysisRepository.find();
      expect(analyses).toHaveLength(2);
    });
  });

  describe('Cover Letter Reuse Flow', () => {
    it('should create new cover letter on first request', async () => {
      // Create test CV
      await cvRepository.save(testCv);

      const response = await request(app.getHttpServer())
        .post(`/cv/${testCv.id}/generate-cover-letter`)
        .send({
          jobDescription: testJobDescription,
          jobTitle: 'Senior React Developer',
          company: 'Test Company',
        })
        .expect(201);

      expect(response.body).toHaveProperty('coverLetter');
      expect(response.body.reused).toBe(false);

      // Verify cover letter was saved
      const coverLetters = await coverLetterRepository.find();
      expect(coverLetters).toHaveLength(1);
      expect(coverLetters[0].jobDescriptionId).toBeDefined();
      expect(coverLetters[0].isSnapshot).toBe(false);
    });

    it('should reuse existing cover letter on second request with same JD', async () => {
      // Create test CV
      await cvRepository.save(testCv);

      // First request - should create new cover letter
      const firstResponse = await request(app.getHttpServer())
        .post(`/cv/${testCv.id}/generate-cover-letter`)
        .send({
          jobDescription: testJobDescription,
          jobTitle: 'Senior React Developer',
          company: 'Test Company',
        })
        .expect(201);

      expect(firstResponse.body.reused).toBe(false);

      // Second request - should reuse existing cover letter
      const secondResponse = await request(app.getHttpServer())
        .post(`/cv/${testCv.id}/generate-cover-letter`)
        .send({
          jobDescription: testJobDescription,
          jobTitle: 'Senior React Developer',
          company: 'Test Company',
        })
        .expect(201);

      expect(secondResponse.body.reused).toBe(true);
      expect(secondResponse.body.coverLetter).toBe(firstResponse.body.coverLetter);

      // Verify only one cover letter exists
      const coverLetters = await coverLetterRepository.find();
      expect(coverLetters).toHaveLength(1);
    });
  });

  describe('API Endpoints', () => {
    beforeEach(async () => {
      // Create test data
      await cvRepository.save(testCv);
      
      const jobDesc = await jobDescriptionRepository.save({
        userId: testUser.id,
        title: 'Senior React Developer',
        description: testJobDescription,
        company: 'Test Company',
      });

      await analysisRepository.save({
        jobDescriptionId: jobDesc.id,
        userId: testUser.id,
        jobDescriptionSnapshot: {
          title: 'Senior React Developer',
          company: 'Test Company',
          description: testJobDescription.substring(0, 500),
          keyRequirements: ['JavaScript', 'React'],
          createdAt: new Date().toISOString(),
        },
        score: 8,
        matchedSkills: ['JavaScript', 'React'],
        missingSkills: ['TypeScript'],
        suggestions: ['Learn TypeScript'],
        strengths: ['Strong React experience'],
        isSnapshot: false,
      });

      await coverLetterRepository.save({
        jobDescriptionId: jobDesc.id,
        userId: testUser.id,
        jobDescriptionSnapshot: {
          title: 'Senior React Developer',
          company: 'Test Company',
          description: testJobDescription.substring(0, 500),
          keyRequirements: ['JavaScript', 'React'],
          createdAt: new Date().toISOString(),
        },
        content: 'Dear Hiring Manager, I am excited to apply for the Senior React Developer position...',
        wordCount: 150,
        isSnapshot: false,
      });
    });

    it('should get user analyses', async () => {
      const response = await request(app.getHttpServer())
        .get('/cv/analyses')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('score');
      expect(response.body[0]).toHaveProperty('jobDescriptionId');
    });

    it('should get user cover letters', async () => {
      const response = await request(app.getHttpServer())
        .get('/cv/cover-letters')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('content');
      expect(response.body[0]).toHaveProperty('jobDescriptionId');
    });

    it('should get analysis by job description ID', async () => {
      const jobDesc = await jobDescriptionRepository.findOne();
      const response = await request(app.getHttpServer())
        .get(`/cv/analyses/job-description/${jobDesc.id}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('score');
      expect(response.body.jobDescriptionId).toBe(jobDesc.id);
    });

    it('should get cover letter by job description ID', async () => {
      const jobDesc = await jobDescriptionRepository.findOne();
      const response = await request(app.getHttpServer())
        .get(`/cv/cover-letters/job-description/${jobDesc.id}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('content');
      expect(response.body.jobDescriptionId).toBe(jobDesc.id);
    });
  });

  describe('Data Integrity', () => {
    it('should maintain referential integrity', async () => {
      // Create test CV
      await cvRepository.save(testCv);

      // Create analysis and cover letter
      await request(app.getHttpServer())
        .post(`/cv/${testCv.id}/analyze-compatibility`)
        .send({
          jobDescription: testJobDescription,
          jobTitle: 'Senior React Developer',
          company: 'Test Company',
        })
        .expect(201);

      await request(app.getHttpServer())
        .post(`/cv/${testCv.id}/generate-cover-letter`)
        .send({
          jobDescription: testJobDescription,
          jobTitle: 'Senior React Developer',
          company: 'Test Company',
        })
        .expect(201);

      // Verify all records have valid JobDescription references
      const analyses = await analysisRepository.find();
      const coverLetters = await coverLetterRepository.find();
      const jobDescriptions = await jobDescriptionRepository.find();

      expect(analyses).toHaveLength(1);
      expect(coverLetters).toHaveLength(1);
      expect(jobDescriptions).toHaveLength(1);

      expect(analyses[0].jobDescriptionId).toBe(jobDescriptions[0].id);
      expect(coverLetters[0].jobDescriptionId).toBe(jobDescriptions[0].id);
    });
  });
});
