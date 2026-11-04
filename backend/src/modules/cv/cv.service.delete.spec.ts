import { CvService } from './cv.service';
import { Cv } from './entities/cv.entity';
import { InterviewPrepPlan } from '../interview-prep/entities/interview-prep-plan.entity';
import { InterviewQuestionAssignment } from '../interview-prep/entities/interview-question-assignment.entity';

describe('CvService.deleteCv', () => {
  const userId = 'user-1';

  function createService(cvRepository: {
    findOne: jest.Mock;
    find: jest.Mock;
    manager: { transaction: jest.Mock };
  }) {
    return new CvService(
      cvRepository as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
    );
  }

  it('deletes a tailored chain and its prep plans in one transaction', async () => {
    const manager = {
      find: jest.fn().mockResolvedValue([{ id: 'plan-b' }, { id: 'plan-c' }]),
      delete: jest.fn().mockResolvedValue({ affected: 1 }),
      update: jest.fn().mockResolvedValue({ affected: 3 }),
    };
    const cvRepository = {
      findOne: jest.fn().mockResolvedValue({ id: 'cv-a', userId }),
      find: jest.fn().mockResolvedValue([
        { id: 'cv-a', originalCvId: null },
        { id: 'cv-b', originalCvId: 'cv-a' },
        { id: 'cv-c', originalCvId: 'cv-b' },
        { id: 'cv-other', originalCvId: null },
      ]),
      manager: {
        transaction: jest.fn(async (work: (m: typeof manager) => Promise<void>) =>
          work(manager),
        ),
      },
    };
    const service = createService(cvRepository);

    await service.deleteCv('cv-a', userId);

    expect(manager.find).toHaveBeenCalledWith(
      InterviewPrepPlan,
      expect.objectContaining({
        where: expect.objectContaining({ userId }),
      }),
    );
    const planWhere = manager.find.mock.calls[0][1].where;
    expect(planWhere.cvId.value).toEqual(['cv-c', 'cv-b', 'cv-a']);

    expect(manager.delete).toHaveBeenNthCalledWith(
      1,
      InterviewQuestionAssignment,
      expect.objectContaining({
        planId: expect.objectContaining({ value: ['plan-b', 'plan-c'] }),
      }),
    );
    expect(manager.delete).toHaveBeenNthCalledWith(
      2,
      InterviewPrepPlan,
      expect.objectContaining({
        id: expect.objectContaining({ value: ['plan-b', 'plan-c'] }),
      }),
    );
    expect(manager.update).toHaveBeenCalledWith(
      Cv,
      expect.objectContaining({
        id: expect.objectContaining({ value: ['cv-c', 'cv-b', 'cv-a'] }),
        userId,
      }),
      { originalCvId: null },
    );
    expect(manager.delete).toHaveBeenNthCalledWith(
      3,
      Cv,
      expect.objectContaining({
        id: expect.objectContaining({ value: ['cv-c', 'cv-b', 'cv-a'] }),
        userId,
      }),
    );
    expect(manager.delete).not.toHaveBeenCalledWith(
      Cv,
      expect.objectContaining({
        id: expect.objectContaining({ value: expect.arrayContaining(['cv-other']) }),
      }),
    );
  });

  it('does nothing when the resume is not owned by the user', async () => {
    const cvRepository = {
      findOne: jest.fn().mockResolvedValue(null),
      find: jest.fn(),
      manager: { transaction: jest.fn() },
    };
    const service = createService(cvRepository);

    await service.deleteCv('missing', userId);

    expect(cvRepository.find).not.toHaveBeenCalled();
    expect(cvRepository.manager.transaction).not.toHaveBeenCalled();
  });

  it('skips prep cleanup when the resume has no interview plans', async () => {
    const manager = {
      find: jest.fn().mockResolvedValue([]),
      delete: jest.fn().mockResolvedValue({ affected: 1 }),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
    };
    const cvRepository = {
      findOne: jest.fn().mockResolvedValue({ id: 'cv-a', userId }),
      find: jest.fn().mockResolvedValue([{ id: 'cv-a', originalCvId: null }]),
      manager: {
        transaction: jest.fn(async (work: (m: typeof manager) => Promise<void>) =>
          work(manager),
        ),
      },
    };
    const service = createService(cvRepository);

    await service.deleteCv('cv-a', userId);

    expect(manager.delete).toHaveBeenCalledTimes(1);
    expect(manager.delete).toHaveBeenCalledWith(
      Cv,
      expect.objectContaining({
        id: expect.objectContaining({ value: ['cv-a'] }),
        userId,
      }),
    );
  });
});
