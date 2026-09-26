import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { PortfolioService } from './portfolio.service';
import { Portfolio } from './entities/portfolio.entity';
import { UsersService } from '../users/users.service';
import { CvService } from '../cv/cv.service';
import { ProjectsService } from '../projects/projects.service';
import { TemplateLoaderService } from './templates/template-loader.service';
import { PortfolioTemplate } from './dto/portfolio.dto';

describe('PortfolioService public portfolio', () => {
  let service: PortfolioService;
  let portfolioRepository: { findOne: jest.Mock };
  let usersService: { findById: jest.Mock; findByEmail: jest.Mock };
  let cvService: { getUserCvs: jest.Mock };
  let projectsService: { getUserProjects: jest.Mock };
  let templateLoaderService: { loadTemplate: jest.Mock };

  const portfolioRow = {
    username: 'alice',
    userId: 'user-1',
    isActive: true,
    template: PortfolioTemplate.BASIC,
    bio: 'Builder',
    avatar: '',
    linkedinUrl: '',
    githubUrl: '',
    websiteUrl: '',
    customDomain: '',
  };

  beforeEach(async () => {
    portfolioRepository = { findOne: jest.fn() };
    usersService = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
    };
    cvService = { getUserCvs: jest.fn() };
    projectsService = { getUserProjects: jest.fn() };
    templateLoaderService = { loadTemplate: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PortfolioService,
        {
          provide: getRepositoryToken(Portfolio),
          useValue: portfolioRepository,
        },
        { provide: UsersService, useValue: usersService },
        { provide: CvService, useValue: cvService },
        { provide: ProjectsService, useValue: projectsService },
        { provide: TemplateLoaderService, useValue: templateLoaderService },
      ],
    }).compile();

    service = module.get(PortfolioService);
  });

  it('loads the portfolio owner by user id instead of username@default.com', async () => {
    portfolioRepository.findOne.mockResolvedValue(portfolioRow);
    usersService.findById.mockResolvedValue({
      id: 'user-1',
      name: 'Alice Nguyen',
      email: 'alice@gmail.com',
      avatar: '',
    });
    cvService.getUserCvs.mockResolvedValue([
      {
        parsedData: {
          summary: 'Engineer',
          skills: {
            technical: ['TypeScript'],
            soft: [],
            languages: [],
            tools: [],
          },
          experience: [
            {
              title: 'Staff Engineer',
              company: 'Acme',
              duration: '2021-2024',
              responsibilities: ['Led the migration'],
            },
          ],
          education: [],
        },
      },
    ]);
    projectsService.getUserProjects.mockResolvedValue([]);

    const result = await service.getPortfolioByUsername('alice');

    expect(usersService.findById).toHaveBeenCalledWith('user-1');
    expect(usersService.findByEmail).not.toHaveBeenCalled();
    expect(result.user.email).toBe('alice@gmail.com');
    expect(result.user.name).toBe('Alice Nguyen');
    expect(result.cv.experience[0].title).toBe('Staff Engineer');
  });

  it('returns not found when no portfolio row exists', async () => {
    portfolioRepository.findOne.mockResolvedValue(null);

    await expect(
      service.getPortfolioByUsername('missing'),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(usersService.findById).not.toHaveBeenCalled();
  });

  it('renders CV job titles and responsibilities on the public page', async () => {
    templateLoaderService.loadTemplate.mockResolvedValue(
      '<section>{{#each cv.experience}}<h3>{{role}}</h3>{{/each}}</section>',
    );

    const html = await service.generatePortfolioHTML({
      user: { name: 'Alice', email: 'alice@gmail.com' },
      cv: {
        summary: '',
        skills: { technical: [], soft: [], languages: [], tools: [] },
        experience: [
          {
            title: 'Staff Engineer',
            company: 'Acme',
            duration: '2021-2024',
            responsibilities: ['Led the migration'],
          },
        ],
        education: [],
      },
      projects: [],
      template: PortfolioTemplate.BASIC,
    });

    expect(html).toContain('Staff Engineer');
    expect(html).toContain('Led the migration');
    expect(html).toContain('Acme');
    expect(html).not.toContain('>Position<');
    expect(html).not.toContain('No description available');
  });
});
