import { In } from 'typeorm';
import { CvService } from './cv.service';
import { Cv } from './entities/cv.entity';
import { InterviewPrepPlan } from '../interview-prep/entities/interview-prep-plan.entity';
import { InterviewQuestionAssignment } from '../interview-prep/entities/interview-question-assignment.entity';

describe('CvService.deleteCv', () => {
  const userId = 'user-1';
  const cv = {
    id: 'cv-original',
    userId,
    originalFileName: 'resume.pdf',
  };

  function createService() {
    const manager = {
      find: jest.fn().mockResolvedValue([{ id: 'plan-1' }]),
      delete: jest.fn().mockResolvedValue({ affected: 1 }),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
    };
    const cvRepository = {
      findOne: jest.fn().mockResolvedValue({ ...cv }),
      manager: {
        transaction: jest.fn(
          async (work: (tx: typeof manager) => Promise<void>) => work(manager),
        ),
      },
    };
    const unused = {} as never;
    const service = new CvService(
      cvRepository as never,
      unused,
      unused,
      unused,
      unused,
      unused,
      unused,
      unused,
      unused,
      unused,
      unused,
      unused,
    );

    return { service, cvRepository, manager };
  }

  it('keeps tailored copies and deletes only the requested resume', async () => {
    const { service, cvRepository, manager } = createService();

    await service.deleteCv(cv.id, userId);

    expect(cvRepository.manager.transaction).toHaveBeenCalledTimes(1);
    expect(manager.find).toHaveBeenCalledWith(InterviewPrepPlan, {
      where: { userId, cvId: In([cv.id]) },
      select: ['id'],
    });
    expect(manager.delete).toHaveBeenNthCalledWith(
      1,
      InterviewQuestionAssignment,
      { planId: In(['plan-1']) },
    );
    expect(manager.delete).toHaveBeenNthCalledWith(2, InterviewPrepPlan, {
      id: In(['plan-1']),
    });
    expect(manager.update).toHaveBeenCalledWith(
      Cv,
      { originalCvId: cv.id, userId },
      { originalCvId: null },
    );
    expect(manager.delete).toHaveBeenNthCalledWith(3, Cv, {
      id: cv.id,
      userId,
    });
  });

  it('detaches tailored copies when the resume has no interview plan', async () => {
    const { service, manager } = createService();
    manager.find.mockResolvedValue([]);

    await service.deleteCv(cv.id, userId);

    expect(manager.update).toHaveBeenCalledWith(
      Cv,
      { originalCvId: cv.id, userId },
      { originalCvId: null },
    );
    expect(manager.delete).toHaveBeenCalledTimes(1);
    expect(manager.delete).toHaveBeenCalledWith(Cv, {
      id: cv.id,
      userId,
    });
  });

  it('does not delete anything when the resume is missing', async () => {
    const { service, cvRepository, manager } = createService();
    cvRepository.findOne.mockResolvedValue(null);

    await service.deleteCv(cv.id, userId);

    expect(cvRepository.manager.transaction).not.toHaveBeenCalled();
    expect(manager.delete).not.toHaveBeenCalled();
    expect(manager.update).not.toHaveBeenCalled();
  });

  it('leaves tailored copies linked when interview-prep cleanup fails', async () => {
    const { service, manager } = createService();
    manager.delete.mockRejectedValueOnce(new Error('fk'));

    await expect(service.deleteCv(cv.id, userId)).rejects.toThrow('fk');

    expect(manager.update).not.toHaveBeenCalled();
    expect(manager.delete).toHaveBeenCalledTimes(1);
    expect(manager.delete).toHaveBeenCalledWith(InterviewQuestionAssignment, {
      planId: In(['plan-1']),
    });
  });
});
