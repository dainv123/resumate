import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { User, UserPlan } from '../users/entities/user.entity';
import { UserUsage } from '../users/entities/user-usage.entity';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: { findOne: jest.Mock; create: jest.Mock; save: jest.Mock };
  let jwtService: { sign: jest.Mock };

  const passwordAccount: Partial<User> = {
    id: 'user-1',
    email: 'ada@example.com',
    name: 'Ada',
    plan: UserPlan.FREE,
    password: '',
  };

  beforeEach(async () => {
    passwordAccount.password = await bcrypt.hash('correct-password', 4);
    userRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };
    jwtService = { sign: jest.fn().mockReturnValue('signed-token') };
    service = new AuthService(
      userRepository as unknown as Repository<User>,
      {} as Repository<UserUsage>,
      jwtService as unknown as JwtService,
    );
  });

  describe('login', () => {
    it('returns a token for a matching password without exposing the hash', async () => {
      userRepository.findOne.mockResolvedValue(passwordAccount);

      const result = await service.login({
        email: 'ada@example.com',
        password: 'correct-password',
      });

      expect(result.token).toBe('signed-token');
      expect(result.user).not.toHaveProperty('password');
      expect(result.user.email).toBe('ada@example.com');
    });

    it('rejects password login for Google accounts that have no password', async () => {
      userRepository.findOne.mockResolvedValue({
        ...passwordAccount,
        password: null,
      });

      await expect(
        service.login({
          email: 'ada@example.com',
          password: 'any-password',
        }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });

  describe('validateUser', () => {
    it('does not include the password hash used by profile endpoints', async () => {
      userRepository.findOne.mockResolvedValue(passwordAccount);

      const user = await service.validateUser('user-1');

      expect(user.email).toBe('ada@example.com');
      expect(user.id).toBe('user-1');
      expect(user).not.toHaveProperty('password');
    });
  });
});
