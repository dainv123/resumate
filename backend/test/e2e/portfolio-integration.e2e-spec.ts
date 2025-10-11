import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PortfolioTemplate } from '../../src/modules/portfolio/dto/portfolio.dto';

describe('Portfolio Integration Tests (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // TODO: Add authentication setup
    // For now, assume we have authToken and userId
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/portfolio/templates (GET)', () => {
    it('should return all available templates', () => {
      return request(app.getHttpServer())
        .get('/portfolio/templates')
        .expect(200)
        .expect((res) => {
          expect(res.body.templates).toBeInstanceOf(Array);
          expect(res.body.templates.length).toBeGreaterThan(0);
          
          // Check first template structure
          const template = res.body.templates[0];
          expect(template).toHaveProperty('id');
          expect(template).toHaveProperty('name');
          expect(template).toHaveProperty('description');
          expect(template).toHaveProperty('sections');
          expect(template).toHaveProperty('allowCustomization');
        });
    });

    it('should include all expected template types', () => {
      return request(app.getHttpServer())
        .get('/portfolio/templates')
        .expect(200)
        .expect((res) => {
          const templateIds = res.body.templates.map((t: any) => t.id);
          expect(templateIds).toContain(PortfolioTemplate.BASIC);
          expect(templateIds).toContain(PortfolioTemplate.MODERN);
          expect(templateIds).toContain(PortfolioTemplate.CREATIVE);
          expect(templateIds).toContain(PortfolioTemplate.MUHAMMAD_ISMAIL);
        });
    });
  });

  describe('/portfolio/generate (POST)', () => {
    it('should generate portfolio with BASIC template', () => {
      const createPortfolioDto = {
        template: PortfolioTemplate.BASIC,
        bio: 'Software Engineer',
        linkedinUrl: 'https://linkedin.com/in/johndoe',
      };

      return request(app.getHttpServer())
        .post('/portfolio/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createPortfolioDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('user');
          expect(res.body).toHaveProperty('cv');
          expect(res.body).toHaveProperty('projects');
          expect(res.body).toHaveProperty('sections');
          expect(res.body.user.bio).toBe('Software Engineer');
        });
    });

    it('should generate portfolio with custom sections', () => {
      const createPortfolioDto = {
        template: PortfolioTemplate.CREATIVE,
        customSections: {
          experience: true, // Creative template has this disabled by default
          education: true,
        },
        bio: 'Creative Developer',
      };

      return request(app.getHttpServer())
        .post('/portfolio/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createPortfolioDto)
        .expect(201)
        .expect((res) => {
          expect(res.body.sections.experience).toBe(true);
          expect(res.body.sections.education).toBe(true);
        });
    });

    it('should use selected CV for portfolio data', () => {
      const createPortfolioDto = {
        template: PortfolioTemplate.MODERN,
        selectedCvId: 'cv-123',
        bio: 'Professional Developer',
      };

      return request(app.getHttpServer())
        .post('/portfolio/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createPortfolioDto)
        .expect(201)
        .expect((res) => {
          expect(res.body.selectedCvId).toBe('cv-123');
        });
    });
  });

  describe('/portfolio/html (POST)', () => {
    it('should generate HTML for portfolio', () => {
      const createPortfolioDto = {
        template: PortfolioTemplate.BASIC,
        bio: 'Software Engineer',
      };

      return request(app.getHttpServer())
        .post('/portfolio/html')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createPortfolioDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('html');
          expect(typeof res.body.html).toBe('string');
          expect(res.body.html).toContain('<!DOCTYPE html>');
        });
    });

    it('should render only enabled sections in HTML', () => {
      const createPortfolioDto = {
        template: PortfolioTemplate.CREATIVE,
        bio: 'Creative Developer',
      };

      return request(app.getHttpServer())
        .post('/portfolio/html')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createPortfolioDto)
        .expect(201)
        .expect((res) => {
          const html = res.body.html;
          // Creative template has experience disabled
          expect(html).not.toContain('SECTION:EXPERIENCE');
        });
    });
  });

  describe('/portfolio/save (POST)', () => {
    it('should save portfolio successfully', () => {
      const createPortfolioDto = {
        template: PortfolioTemplate.MODERN,
        bio: 'Full Stack Developer',
        linkedinUrl: 'https://linkedin.com/in/johndoe',
        githubUrl: 'https://github.com/johndoe',
      };

      return request(app.getHttpServer())
        .post('/portfolio/save')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createPortfolioDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('generatedUrl');
          expect(res.body).toHaveProperty('template');
          expect(res.body.template).toBe(PortfolioTemplate.MODERN);
          expect(res.body.status).toBe('success');
        });
    });

    it('should update existing portfolio', () => {
      const createPortfolioDto = {
        template: PortfolioTemplate.CREATIVE,
        bio: 'Updated Bio',
      };

      return request(app.getHttpServer())
        .post('/portfolio/save')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createPortfolioDto)
        .expect(201)
        .expect((res) => {
          expect(res.body.message).toContain('updated');
        });
    });
  });

  describe('/portfolio/check (GET)', () => {
    it('should check if portfolio exists', () => {
      return request(app.getHttpServer())
        .get('/portfolio/check')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('exists');
          expect(typeof res.body.exists).toBe('boolean');
        });
    });

    it('should return portfolio details if exists', () => {
      return request(app.getHttpServer())
        .get('/portfolio/check')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          if (res.body.exists) {
            expect(res.body.portfolio).toHaveProperty('url');
            expect(res.body.portfolio).toHaveProperty('template');
            expect(res.body.portfolio).toHaveProperty('updatedAt');
          }
        });
    });
  });

  describe('Complete Portfolio Workflow', () => {
    it('should complete full workflow: generate -> preview -> save', async () => {
      const createPortfolioDto = {
        template: PortfolioTemplate.MODERN,
        selectedCvId: 'cv-123',
        customSections: {
          certifications: true,
        },
        bio: 'Full Stack Developer',
        linkedinUrl: 'https://linkedin.com/in/johndoe',
      };

      // Step 1: Generate portfolio data
      const generateRes = await request(app.getHttpServer())
        .post('/portfolio/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createPortfolioDto)
        .expect(201);

      expect(generateRes.body.sections.certifications).toBe(true);

      // Step 2: Generate HTML preview
      const htmlRes = await request(app.getHttpServer())
        .post('/portfolio/html')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createPortfolioDto)
        .expect(201);

      expect(htmlRes.body.html).toBeDefined();

      // Step 3: Save portfolio
      const saveRes = await request(app.getHttpServer())
        .post('/portfolio/save')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createPortfolioDto)
        .expect(201);

      expect(saveRes.body.generatedUrl).toBeDefined();

      // Step 4: Check portfolio exists
      const checkRes = await request(app.getHttpServer())
        .get('/portfolio/check')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(checkRes.body.exists).toBe(true);
    });
  });
});

