import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UserUsage } from './entities/user-usage.entity';
import { Cv } from '../cv/entities/cv.entity';
import { Project } from '../projects/entities/project.entity';
import { RedisService } from '../../shared/redis/redis.service';
import { RedisKey } from '../../shared/redis/redis.constants';

describe('UsersService.deleteAccount', () => {
  const userId = 'user-1';
  let service: UsersService;
  let userRepository: { findOne: jest.Mock; remove: jest.Mock };
  let dataSource: { query: jest.Mock; transaction: jest.Mock };
  let redisService: { del: jest.Mock };
  let managerQuery: jest.Mock;

  beforeEach(async () => {
    managerQuery = jest.fn().mockResolvedValue([]);
    userRepository = {
      findOne: jest.fn().mockResolvedValue({ id: userId, email: 'jane@ex.com' }),
      remove: jest.fn(),
    };
    dataSource = {
      query: jest.fn().mockResolvedValue([{ username: 'jane' }]),
      transaction: jest.fn(async (fn: (manager: { query: jest.Mock }) => Promise<void>) =>
        fn({ query: managerQuery }),
      ),
    };
    redisService = { del: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: userRepository },
        { provide: getRepositoryToken(UserUsage), useValue: {} },
        { provide: getRepositoryToken(Cv), useValue: {} },
        { provide: getRepositoryToken(Project), useValue: {} },
        { provide: DataSource, useValue: dataSource },
        { provide: RedisService, useValue: redisService },
      ],
    }).compile();

    service = module.get(UsersService);
  });

  it('deletes dependent rows in one transaction before the user', async () => {
    await expect(service.deleteAccount(userId)).resolves.toEqual({
      message: 'Account deleted successfully',
    });

    expect(dataSource.transaction).toHaveBeenCalledTimes(1);
    expect(userRepository.remove).not.toHaveBeenCalled();

    const tables = managerQuery.mock.calls.map((call) => String(call[0]));
    const order = [
      'interview_question_assignments',
      'interview_prep_plans',
      'cv_matching_analyses',
      'cv_cover_letters',
      'cvs',
      'job_descriptions',
      'projects',
      'portfolios',
      'analytics',
      'user_usage',
      'users',
    ];
    expect(tables).toHaveLength(order.length);
    order.forEach((table, index) => {
      expect(tables[index]).toContain(table);
      expect(managerQuery.mock.calls[index][1]).toEqual([userId]);
    });
    const userDeleteAt = tables.findIndex((sql) => sql.includes('DELETE FROM users'));
    const cvDeleteAt = tables.findIndex((sql) => sql.includes('DELETE FROM cvs'));
    expect(cvDeleteAt).toBeGreaterThan(-1);
    expect(userDeleteAt).toBeGreaterThan(cvDeleteAt);

    expect(redisService.del).toHaveBeenCalledWith(RedisKey.portfolioHtml('jane'));
  });

  it('propagates a transaction failure without clearing the portfolio cache', async () => {
    dataSource.transaction.mockImplementation(async () => {
      throw new Error('update or delete on table "users" violates foreign key constraint');
    });

    await expect(service.deleteAccount(userId)).rejects.toThrow(
      'violates foreign key constraint',
    );
    expect(redisService.del).not.toHaveBeenCalled();
    expect(userRepository.remove).not.toHaveBeenCalled();
  });
});
