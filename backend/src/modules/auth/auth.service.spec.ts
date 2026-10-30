import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { AuthService } from './auth.service';
import { User } from '../users/entities/user.entity';
import { UserUsage } from '../users/entities/user-usage.entity';

describe('AuthService googleAuth', () => {
  const userRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };
  const userUsageRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };
  const jwtService = {
    sign: jest.fn(),
  };

  const service = new AuthService(
    userRepository as unknown as Repository<User>,
    userUsageRepository as unknown as Repository<UserUsage>,
    jwtService as unknown as JwtService,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not issue a session from a client-supplied Google profile', () => {
    expect(() => service.googleAuth()).toThrow(UnauthorizedException);

    expect(userRepository.findOne).not.toHaveBeenCalled();
    expect(userRepository.save).not.toHaveBeenCalled();
    expect(jwtService.sign).not.toHaveBeenCalled();
  });
});
