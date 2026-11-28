import { PrepPlanStatus } from '../constants/interview-prep.constants';
import { formatDateISO } from '../domain/pass-framework';
import { InterviewPrepReminderTask } from './interview-prep-reminder.task';

describe('InterviewPrepReminderTask', () => {
  const today = formatDateISO(new Date());

  function buildTask() {
    const planRepo = {
      find: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };
    const usersService = { findById: jest.fn() };
    const notificationsService = { notifyDailyPrepReminder: jest.fn() };
    const analyticsService = { track: jest.fn() };
    const task = new InterviewPrepReminderTask(
      planRepo as never,
      usersService as never,
      notificationsService as never,
      analyticsService as never,
    );
    return {
      task,
      planRepo,
      usersService,
      notificationsService,
      analyticsService,
    };
  }

  function activePlan() {
    return {
      id: 'plan-1',
      userId: 'user-1',
      status: PrepPlanStatus.ACTIVE,
      interviewDate: new Date('2099-06-15T12:00:00.000Z'),
      lastReminderDate: null as string | null,
      readinessScore: 40,
      roadmap: [
        {
          date: today,
          dayIndex: 0,
          daysUntilInterview: 2,
          theme: 'Practice',
          tasks: [{ id: 't1', title: 'Review STAR', done: false }],
        },
      ],
    };
  }

  it('records the reminder date without rewriting the plan', async () => {
    const { task, planRepo, usersService, notificationsService } = buildTask();
    const plan = activePlan();
    planRepo.find.mockResolvedValue([plan]);
    usersService.findById.mockResolvedValue({
      email: 'ada@example.com',
      name: 'Ada',
    });
    notificationsService.notifyDailyPrepReminder.mockImplementation(
      async () => {
        plan.roadmap = [
          {
            ...plan.roadmap[0],
            tasks: [{ id: 't1', title: 'Review STAR', done: true }],
          },
        ];
      },
    );

    await task.sendDailyReminders();

    expect(notificationsService.notifyDailyPrepReminder).toHaveBeenCalledWith(
      'ada@example.com',
      'Ada',
      'plan-1',
      expect.objectContaining({ theme: 'Practice' }),
      40,
    );
    expect(planRepo.save).not.toHaveBeenCalled();
    expect(planRepo.update).toHaveBeenCalledWith('plan-1', {
      lastReminderDate: today,
    });
  });

  it('does not send a second reminder the same day', async () => {
    const { task, planRepo, notificationsService } = buildTask();
    const plan = activePlan();
    plan.lastReminderDate = today;
    planRepo.find.mockResolvedValue([plan]);

    await task.sendDailyReminders();

    expect(notificationsService.notifyDailyPrepReminder).not.toHaveBeenCalled();
    expect(planRepo.update).not.toHaveBeenCalled();
    expect(planRepo.save).not.toHaveBeenCalled();
  });
});
