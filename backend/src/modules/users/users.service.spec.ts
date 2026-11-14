import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

describe('UsersService.deleteAccount', () => {
  const userId = 'user-1';

  function createService(options?: {
    user?: User | null;
    queryImpl?: (sql: string) => Promise<unknown>;
  }) {
    const queries: string[] = [];
    const manager = {
      query: jest.fn(async (sql: string) => {
        queries.push(sql);
        if (options?.queryImpl) {
          await options.queryImpl(sql);
        }
      }),
      delete: jest.fn(async (entity: unknown) => {
        queries.push(`DELETE ${entity === User ? 'users' : 'other'}`);
      }),
    };
    const transaction = jest.fn(async (cb: (m: typeof manager) => Promise<void>) =>
      cb(manager),
    );
    const userRepository = {
      findOne: jest.fn().mockResolvedValue(
        options && 'user' in options ? options.user : { id: userId },
      ),
      manager: { transaction },
    };

    const service = new UsersService(
      userRepository as never,
      {} as never,
      {} as never,
      {} as never,
    );

    return { service, queries, manager, transaction, userRepository };
  }

  it('deletes dependent rows before the user inside one transaction', async () => {
    const { service, queries, transaction, manager } = createService();

    await expect(service.deleteAccount(userId)).resolves.toEqual({
      message: 'Account deleted successfully',
    });

    expect(transaction).toHaveBeenCalledTimes(1);
    expect(queries.at(-1)).toBe('DELETE users');
    expect(manager.delete).toHaveBeenCalledWith(User, { id: userId });

    const indexOf = (snippet: string) =>
      queries.findIndex((sql) => sql.includes(snippet));

    const plans = indexOf('DELETE FROM interview_prep_plans');
    const assignments = indexOf('interview_question_assignments');
    const analyses = indexOf('cv_matching_analyses');
    const letters = indexOf('cv_cover_letters');
    const tailoredCvs = queries.findIndex(
      (sql) => sql.includes('FROM cvs') && sql.includes('originalCvId'),
    );
    const cvs = queries.findIndex(
      (sql) =>
        sql.includes('DELETE FROM cvs') && !sql.includes('originalCvId'),
    );
    const jobDescriptions = indexOf('job_descriptions');
    const portfolios = indexOf('portfolios');
    const analytics = indexOf('analytics');
    const projects = indexOf('FROM projects');
    const usage = indexOf('user_usage');

    expect(assignments).toBeGreaterThan(-1);
    expect(assignments).toBeLessThan(plans);
    expect(plans).toBeLessThan(cvs);
    expect(analyses).toBeLessThan(cvs);
    expect(letters).toBeLessThan(cvs);
    expect(tailoredCvs).toBeLessThan(cvs);
    expect(cvs).toBeLessThan(jobDescriptions);
    expect(portfolios).toBeLessThan(queries.length - 1);
    expect(analytics).toBeLessThan(queries.length - 1);
    expect(projects).toBeLessThan(queries.length - 1);
    expect(usage).toBeLessThan(queries.length - 1);
    expect(jobDescriptions).toBeLessThan(queries.length - 1);

    for (const sql of queries.slice(0, -1)) {
      expect(sql).toContain('$1');
    }
    expect(manager.query).toHaveBeenCalledWith(expect.any(String), [userId]);
  });

  it('does not delete when the user does not exist', async () => {
    const { service, transaction } = createService({ user: null });

    await expect(service.deleteAccount(userId)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(transaction).not.toHaveBeenCalled();
  });

  it('propagates a mid-delete failure so the transaction can roll back', async () => {
    const { service, manager } = createService({
      queryImpl: async (sql) => {
        if (sql.includes('job_descriptions')) {
          throw new Error('update or delete on table "users" violates foreign key');
        }
      },
    });

    await expect(service.deleteAccount(userId)).rejects.toThrow(
      'violates foreign key',
    );
    expect(manager.delete).not.toHaveBeenCalled();
  });
});
