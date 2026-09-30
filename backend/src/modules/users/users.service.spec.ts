import { UsersService } from './users.service';
import { User, UserPlan } from './entities/user.entity';

describe('UsersService.updateProfile', () => {
  const attackerId = 'attacker-id';
  const victimId = 'victim-id';

  const existingUser: User = {
    id: attackerId,
    email: 'attacker@example.com',
    name: 'Attacker',
    avatar: 'https://cdn.example/attacker.png',
    plan: UserPlan.FREE,
    googleId: 'google-attacker',
    password: '$2b$12$existinghash',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    cvs: [],
    projects: [],
    usage: [],
    jobDescriptions: [],
  };

  let savedUser: User | undefined;
  const userRepository = {
    findOne: jest.fn(({ where }: { where: { id: string } }) => {
      if (where.id === attackerId) {
        return Promise.resolve({ ...existingUser });
      }
      return Promise.resolve(null);
    }),
    save: jest.fn((user: User) => {
      savedUser = user;
      return Promise.resolve(user);
    }),
  };
  const userUsageRepository = {};

  const service = new UsersService(
    userRepository as never,
    userUsageRepository as never,
  );

  beforeEach(() => {
    savedUser = undefined;
    userRepository.save.mockClear();
  });

  it('updates name and avatar only, ignoring id, email, password, and plan', async () => {
    const result = await service.updateProfile(attackerId, {
      name: 'New Name',
      avatar: 'https://cdn.example/new.png',
      id: victimId,
      email: 'victim-takeover@example.com',
      password: '$2b$12$attackercontrolledhash',
      plan: UserPlan.PRO,
    } as never);

    expect(userRepository.save).toHaveBeenCalledTimes(1);
    expect(savedUser).toEqual(
      expect.objectContaining({
        id: attackerId,
        email: 'attacker@example.com',
        name: 'New Name',
        avatar: 'https://cdn.example/new.png',
        plan: UserPlan.FREE,
        password: '$2b$12$existinghash',
        googleId: 'google-attacker',
      }),
    );
    expect(result).not.toHaveProperty('password');
    expect(result.id).toBe(attackerId);
    expect(result.email).toBe('attacker@example.com');
    expect(result.plan).toBe(UserPlan.FREE);
  });
});
