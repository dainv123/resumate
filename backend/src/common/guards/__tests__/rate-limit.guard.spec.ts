import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { RateLimitGuard } from '../rate-limit.guard';
import { RateLimitStrategyFactory } from '../../factories/rate-limit-strategy.factory';
import { IRateLimitStrategy } from '../../strategies/rate-limit.strategy';

describe('RateLimitGuard', () => {
  let guard: RateLimitGuard;
  let mockStrategy: jest.Mocked<IRateLimitStrategy>;
  let mockReflector: jest.Mocked<Reflector>;
  let mockStrategyFactory: jest.Mocked<RateLimitStrategyFactory>;

  beforeEach(async () => {
    // Mock strategy
    mockStrategy = {
      checkLimit: jest.fn(),
      getRemaining: jest.fn(),
      getRateLimitInfo: jest.fn(),
    };

    // Mock reflector
    mockReflector = {
      get: jest.fn(),
    } as any;

    // Mock factory
    mockStrategyFactory = {
      getStrategy: jest.fn().mockReturnValue(mockStrategy),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RateLimitGuard,
        { provide: Reflector, useValue: mockReflector },
        { provide: RateLimitStrategyFactory, useValue: mockStrategyFactory },
      ],
    }).compile();

    guard = module.get<RateLimitGuard>(RateLimitGuard);
  });

  describe('canActivate', () => {
    it('should allow request when no rate limit decorator', async () => {
      mockReflector.get.mockReturnValue(null);

      const mockContext = createMockContext();
      const result = await guard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(mockStrategy.checkLimit).not.toHaveBeenCalled();
    });

    it('should allow request when user is not authenticated', async () => {
      mockReflector.get.mockReturnValue({ limit: 10, window: 'minute' });

      const mockContext = createMockContext({ user: null });
      const result = await guard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(mockStrategy.checkLimit).not.toHaveBeenCalled();
    });

    it('should allow request within rate limit', async () => {
      mockReflector.get.mockReturnValue({ limit: 10, window: 'minute' });
      mockStrategy.checkLimit.mockResolvedValue(true);
      mockStrategy.getRateLimitInfo.mockResolvedValue({
        limit: 10,
        remaining: 5,
        reset: Date.now() + 60000,
      });

      const mockContext = createMockContext();
      const result = await guard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(mockStrategy.checkLimit).toHaveBeenCalledWith(
        'user-123',
        'free',
        'minute',
      );
    });

    it('should block request when rate limit exceeded', async () => {
      mockReflector.get.mockReturnValue({ limit: 10, window: 'minute' });
      mockStrategy.checkLimit.mockResolvedValue(false);
      mockStrategy.getRateLimitInfo.mockResolvedValue({
        limit: 10,
        remaining: 0,
        reset: Date.now() + 42000,
      });

      const mockContext = createMockContext();

      await expect(guard.canActivate(mockContext)).rejects.toThrow();
    });

    it('should set rate limit headers', async () => {
      mockReflector.get.mockReturnValue({ limit: 10, window: 'minute' });
      mockStrategy.checkLimit.mockResolvedValue(true);
      mockStrategy.getRateLimitInfo.mockResolvedValue({
        limit: 10,
        remaining: 5,
        reset: Date.now() + 60000,
      });

      const mockContext = createMockContext();
      const mockResponse = mockContext.switchToHttp().getResponse();

      await guard.canActivate(mockContext);

      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', 10);
      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', 5);
      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-RateLimit-Reset', expect.any(Number));
    });

    it('should fail-open when strategy throws error', async () => {
      mockReflector.get.mockReturnValue({ limit: 10, window: 'minute' });
      mockStrategy.checkLimit.mockRejectedValue(new Error('Redis error'));

      const mockContext = createMockContext();
      const result = await guard.canActivate(mockContext);

      // Should allow request when check fails (fail-open)
      expect(result).toBe(true);
    });
  });

  // Helper function to create mock execution context
  function createMockContext(overrides: any = {}): ExecutionContext {
    const defaultUser = { id: 'user-123', plan: 'free' };
    const user = overrides.user !== undefined ? overrides.user : defaultUser;

    const mockResponse = {
      setHeader: jest.fn(),
    };

    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
        getResponse: () => mockResponse,
      }),
      getHandler: () => ({}),
    } as any;
  }
});

