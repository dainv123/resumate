import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from '../users/entities/user.entity';
import { UserUsage } from '../users/entities/user-usage.entity';

describe('AuthService credentials', () => {
  let service: AuthService;
  let userRepository: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };
  let userUsageRepository: { create: jest.Mock; save: jest.Mock };
  let jwtService: { sign: jest.Mock };
  const originalFetch = global.fetch;
  const originalClientId = process.env.GOOGLE_CLIENT_ID;

  beforeEach(async () => {
    userRepository = {
      findOne: jest.fn(),
      create: jest.fn().mockImplementation((dto) => dto),
      save: jest
        .fn()
        .mockImplementation(async (user) => ({ id: 'new-user', ...user })),
    };
    userUsageRepository = {
      create: jest.fn().mockImplementation((dto) => dto),
      save: jest.fn().mockResolvedValue(undefined),
    };
    jwtService = { sign: jest.fn().mockReturnValue('signed-token') };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: userRepository },
        {
          provide: getRepositoryToken(UserUsage),
          useValue: userUsageRepository,
        },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get(AuthService);
    process.env.GOOGLE_CLIENT_ID = 'test-client-id';
  });

  afterEach(() => {
    global.fetch = originalFetch;
    if (originalClientId === undefined) {
      delete process.env.GOOGLE_CLIENT_ID;
    } else {
      process.env.GOOGLE_CLIENT_ID = originalClientId;
    }
  });

  it('rejects password login for Google accounts that have no password', async () => {
    userRepository.findOne.mockResolvedValue({
      id: 'user-1',
      email: 'alice@gmail.com',
      password: null,
      name: 'Alice',
    });

    await expect(
      service.login({ email: 'alice@gmail.com', password: 'anything-at-all' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(jwtService.sign).not.toHaveBeenCalled();
  });

  it('does not issue a session from an unverified Google profile', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({}),
    }) as unknown as typeof fetch;

    await expect(
      service.googleAuth({ idToken: 'a'.repeat(40) }),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(userRepository.findOne).not.toHaveBeenCalled();
    expect(userRepository.save).not.toHaveBeenCalled();
    expect(jwtService.sign).not.toHaveBeenCalled();
  });

  it('signs in the verified token email and ignores any other identity', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        iss: 'https://accounts.google.com',
        aud: 'test-client-id',
        sub: 'google-sub-alice',
        email: 'alice@gmail.com',
        email_verified: 'true',
        name: 'Alice Nguyen',
        picture: 'https://example.com/alice.png',
      }),
    }) as unknown as typeof fetch;

    userRepository.findOne.mockImplementation(
      async ({ where }: { where: { email?: string } }) => {
        if (where.email === 'alice@gmail.com') {
          return {
            id: 'user-1',
            email: 'alice@gmail.com',
            name: 'Alice Nguyen',
            googleId: null,
            avatar: '',
            plan: 'free',
          };
        }
        return {
          id: 'victim',
          email: 'victim@example.com',
          name: 'Victim',
          plan: 'free',
        };
      },
    );
    userRepository.save.mockImplementation(async (user) => user);

    const result = await service.googleAuth({
      idToken: 'header.payload.signature-token',
    });

    expect(userRepository.findOne).toHaveBeenCalledWith({
      where: { email: 'alice@gmail.com' },
    });
    expect(jwtService.sign).toHaveBeenCalledWith(
      expect.objectContaining({ sub: 'user-1', email: 'alice@gmail.com' }),
    );
    expect(result.user.email).toBe('alice@gmail.com');
    expect(result.token).toBe('signed-token');
  });

  it('rejects a token issued for a different client', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        iss: 'https://accounts.google.com',
        aud: 'some-other-client',
        sub: 'google-sub',
        email: 'alice@gmail.com',
        email_verified: 'true',
        name: 'Alice',
      }),
    }) as unknown as typeof fetch;

    await expect(
      service.googleAuth({ idToken: 'header.payload.signature-token' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(userRepository.findOne).not.toHaveBeenCalled();
  });
});
