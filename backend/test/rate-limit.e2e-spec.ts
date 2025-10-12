import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { RedisService } from '../src/shared/redis/redis.service';

describe('Rate Limiting (e2e)', () => {
  let app: INestApplication;
  let redisService: RedisService;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    redisService = moduleFixture.get<RedisService>(RedisService);
    await app.init();

    // Get auth token for testing
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });

    authToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clear Redis before each test
    await redisService.flushAll();
  });

  describe('Rate Limit - Free Plan', () => {
    it('should allow 10 requests per minute (free plan)', async () => {
      const requests = [];
      
      // Make 10 requests
      for (let i = 0; i < 10; i++) {
        requests.push(
          request(app.getHttpServer())
            .get('/api/cv')
            .set('Authorization', `Bearer ${authToken}`)
        );
      }

      const responses = await Promise.all(requests);
      
      // All should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });

    it('should block 11th request (free plan limit)', async () => {
      // Make 10 successful requests
      for (let i = 0; i < 10; i++) {
        await request(app.getHttpServer())
          .get('/api/cv')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);
      }

      // 11th request should be blocked
      const response = await request(app.getHttpServer())
        .get('/api/cv')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(429);
      expect(response.body).toHaveProperty('statusCode', 429);
      expect(response.body).toHaveProperty('message', 'Too many requests');
      expect(response.body).toHaveProperty('retryAfter');
      expect(response.body).toHaveProperty('limit', 10);
    });

    it('should include rate limit headers', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/cv')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.headers).toHaveProperty('x-ratelimit-limit');
      expect(response.headers).toHaveProperty('x-ratelimit-remaining');
      expect(response.headers).toHaveProperty('x-ratelimit-reset');
    });

    it('should reset after TTL expires', async () => {
      // Make 10 requests
      for (let i = 0; i < 10; i++) {
        await request(app.getHttpServer())
          .get('/api/cv')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);
      }

      // 11th should be blocked
      await request(app.getHttpServer())
        .get('/api/cv')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(429);

      // Wait for TTL (60 seconds) - in test, we can manually delete the key
      const userId = 'test-user-id'; // Get from decoded token
      await redisService.del(`rate:${userId}:minute`);

      // Should work again
      await request(app.getHttpServer())
        .get('/api/cv')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });

  describe('Usage Limits - Free Plan', () => {
    it('should allow CV upload within quota', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/cv/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', Buffer.from('fake cv content'), 'test.pdf')
        .expect(201);

      expect(response.body).toHaveProperty('usage');
      expect(response.body.usage.cvUploads.used).toBe(1);
      expect(response.body.usage.cvUploads.limit).toBe(1);
    });

    it('should block CV upload when quota exceeded', async () => {
      // First upload - should succeed
      await request(app.getHttpServer())
        .post('/api/cv/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', Buffer.from('fake cv content'), 'test.pdf')
        .expect(201);

      // Second upload - should be blocked (free plan: 1/month)
      const response = await request(app.getHttpServer())
        .post('/api/cv/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', Buffer.from('fake cv content'), 'test2.pdf');

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('statusCode', 403);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('usage');
      expect(response.body.usage.used).toBe(1);
      expect(response.body.usage.limit).toBe(1);
      expect(response.body).toHaveProperty('upgrade');
    });
  });

  describe('Strategy Switching', () => {
    it('should work with disabled strategy', async () => {
      // Set env to disabled
      process.env.ENABLE_RATE_LIMITING = 'false';

      // Make many requests - all should succeed
      const requests = [];
      for (let i = 0; i < 20; i++) {
        requests.push(
          request(app.getHttpServer())
            .get('/api/cv')
            .set('Authorization', `Bearer ${authToken}`)
        );
      }

      const responses = await Promise.all(requests);
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      // Reset
      process.env.ENABLE_RATE_LIMITING = 'true';
    });
  });

  describe('Health Checks', () => {
    it('should return rate limit status', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/health/rate-limit-status')
        .expect(200);

      expect(response.body).toHaveProperty('strategy');
      expect(response.body).toHaveProperty('enabled');
      expect(response.body).toHaveProperty('health');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should show healthy Redis', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/health/rate-limit-status')
        .expect(200);

      expect(response.body.strategy).toBe('redis');
      expect(response.body.enabled).toBe(true);
      expect(response.body.health).toBe('healthy');
    });
  });
});

