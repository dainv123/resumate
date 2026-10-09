import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PortfolioService } from './portfolio.service';
import { Portfolio } from './entities/portfolio.entity';
import { UsersService } from '../users/users.service';
import { CvService } from '../cv/cv.service';
import { ProjectsService } from '../projects/projects.service';
import { TemplateLoaderService } from './templates/template-loader.service';
import { PortfolioTemplate } from './dto/portfolio.dto';

type StoredPortfolio = {
  userId: string;
  username: string;
  uuid: string;
  isActive?: boolean;
  generatedUrl: string;
  generatedHtml: string;
  bio?: string;
  template: PortfolioTemplate;
};

describe('PortfolioService savePortfolio', () => {
  let service: PortfolioService;
  const store: StoredPortfolio[] = [];

  const user1 = {
    id: 'user-1',
    email: 'alice@gmail.com',
    name: 'Alice Gmail',
    avatar: '',
  };
  const user2 = {
    id: 'user-2',
    email: 'alice@yahoo.com',
    name: 'Alice Yahoo',
    avatar: '',
  };

  const dto = {
    template: PortfolioTemplate.BASIC,
    bio: 'Building reliable software',
  };

  beforeEach(async () => {
    store.length = 0;
    process.env.BACKEND_URL = 'http://localhost:5001';

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PortfolioService,
        {
          provide: getRepositoryToken(Portfolio),
          useValue: {
            findOne: jest.fn(
              ({ where }: { where: Partial<StoredPortfolio> }) => {
                const match =
                  store.find((item) =>
                    Object.entries(where).every(
                      ([key, value]) =>
                        item[key as keyof StoredPortfolio] === value,
                    ),
                  ) ?? null;
                return Promise.resolve(match);
              },
            ),
            create: jest.fn((entity: StoredPortfolio) => ({ ...entity })),
            save: jest.fn((entity: StoredPortfolio) => {
              const saved: StoredPortfolio = {
                ...entity,
                isActive: entity.isActive ?? true,
              };
              const index = store.findIndex(
                (item) => item.userId === saved.userId,
              );
              if (index >= 0) {
                store[index] = saved;
              } else {
                store.push(saved);
              }
              return Promise.resolve(saved);
            }),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findById: jest.fn((id: string) => {
              const user = [user1, user2].find((item) => item.id === id);
              if (!user) {
                return Promise.reject(new Error('User not found'));
              }
              return Promise.resolve(user);
            }),
          },
        },
        {
          provide: CvService,
          useValue: {
            getUserCvs: jest.fn().mockResolvedValue([]),
          },
        },
        {
          provide: ProjectsService,
          useValue: {
            getProjectsForPortfolio: jest.fn().mockResolvedValue([]),
          },
        },
        {
          provide: TemplateLoaderService,
          useValue: {
            loadTemplate: jest.fn().mockResolvedValue('<p>{{user.name}}</p>'),
          },
        },
      ],
    }).compile();

    service = module.get(PortfolioService);
  });

  it('publishes a portfolio at the uuid route that serves stored HTML', async () => {
    const saved = await service.savePortfolio(user1.id, dto);

    expect(saved.username).toBe('alice');
    expect(saved.generatedHtml).toContain('Alice Gmail');
    expect(saved.generatedUrl).toBe(
      `http://localhost:5001/portfolio/uuid/${saved.uuid}`,
    );
    expect(saved.uuid).toBeTruthy();
  });

  it('keeps the same public url when the owner publishes again', async () => {
    const first = await service.savePortfolio(user1.id, dto);
    const second = await service.savePortfolio(user1.id, {
      ...dto,
      bio: 'Updated bio',
    });

    expect(second.uuid).toBe(first.uuid);
    expect(second.generatedUrl).toBe(first.generatedUrl);
    expect(second.username).toBe('alice');
    expect(store).toHaveLength(1);
  });

  it('does not give two users with the same email prefix the same username', async () => {
    const first = await service.savePortfolio(user1.id, dto);
    const second = await service.savePortfolio(user2.id, dto);

    expect(first.username).toBe('alice');
    expect(second.username).toBe('alice-user-2');
    expect(second.generatedUrl).not.toBe(first.generatedUrl);
    expect(second.generatedUrl).toBe(
      `http://localhost:5001/portfolio/uuid/${second.uuid}`,
    );
  });
});
