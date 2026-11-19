import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { PortfolioService } from './portfolio.service';
import { Portfolio as PortfolioEntity } from './entities/portfolio.entity';
import { UsersService } from '../users/users.service';
import { CvService } from '../cv/cv.service';
import { ProjectsService } from '../projects/projects.service';
import { TemplateLoaderService } from './templates/template-loader.service';
import { PortfolioTemplate } from './dto/portfolio.dto';
import { RedisService } from '../../shared/redis/redis.service';
import { ConfigService } from '@nestjs/config';
import { RedisKey } from '../../shared/redis/redis.constants';

describe('PortfolioService', () => {
  let service: PortfolioService;
  let portfolioRepository: Repository<PortfolioEntity>;
  let usersService: UsersService;
  let cvService: CvService;
  let projectsService: ProjectsService;
  let templateLoaderService: TemplateLoaderService;
  let redisService: RedisService;

  const mockUser = {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'https://example.com/avatar.jpg',
  };

  const mockCv = {
    id: 'cv-1',
    parsedData: {
      summary: 'Experienced developer',
      skills: {
        technical: ['JavaScript', 'TypeScript', 'React'],
        soft: ['Communication', 'Leadership'],
        languages: ['English', 'Vietnamese'],
        tools: ['Git', 'Docker'],
      },
      experience: [
        {
          title: 'Senior Developer',
          company: 'Tech Corp',
          duration: '2020-2023',
          responsibilities: ['Lead team', 'Code review'],
          achievements: ['Shipped v2 platform'],
          technologies: ['React', 'Node.js'],
        },
      ],
      education: [
        {
          degree: 'Bachelor of Computer Science',
          school: 'Tech University',
          year: '2015-2019',
          gpa: '3.8',
        },
      ],
      projects: [
        {
          name: 'CV Portfolio App',
          description: 'Personal portfolio from CV data',
          techStack: ['Next.js', 'Nest.js'],
          link: 'https://example.com',
        },
      ],
      certifications: [
        {
          name: 'AWS Certified',
          issuer: 'Amazon',
          date: '2022',
          credentialUrl: 'https://aws.amazon.com/cert',
        },
      ],
      awards: [
        {
          title: 'Best Developer',
          issuer: 'Tech Corp',
          date: '2022',
        },
      ],
      contact: {
        name: 'Dai Nguyen',
        email: 'dai@example.com',
        linkedin: 'https://linkedin.com/in/dai',
        github: 'https://github.com/dai',
      },
    },
  };

  const mockProjects = [
    {
      id: 'project-1',
      name: 'E-commerce Platform',
      description: 'Built a scalable e-commerce platform',
      techStack: ['React', 'Node.js', 'PostgreSQL'],
      demoLink: 'https://demo.com',
      githubLink: 'https://github.com/user/project',
    },
  ];

  const mockTemplate = `
    <!-- SECTION:HERO -->
    <h1>{{user.name}}</h1>
    <p>{{user.bio}}</p>
    <!-- /SECTION:HERO -->
    
    <!-- SECTION:ABOUT -->
    {{#if cv.summary}}
    <p>{{cv.summary}}</p>
    {{/if}}
    <!-- /SECTION:ABOUT -->
    
    <!-- SECTION:SKILLS -->
    {{#if cv.skills.technical}}
    {{#each cv.skills.technical}}
    <span>{{this}}</span>
    {{/each}}
    {{/if}}
    <!-- /SECTION:SKILLS -->
    
    <!-- SECTION:EXPERIENCE -->
    {{#if cv.experience}}
    {{#each cv.experience}}
    <div>{{title}} at {{company}}</div>
    {{/each}}
    {{/if}}
    <!-- /SECTION:EXPERIENCE -->

    <!-- SECTION:EDUCATION -->
    {{#if cv.education}}
    {{#each cv.education}}
    <div>{{degree}} — {{school}}</div>
    {{/each}}
    {{/if}}
    <!-- /SECTION:EDUCATION -->

    <!-- SECTION:CERTIFICATIONS -->
    {{#if cv.certifications}}
    {{#each cv.certifications}}
    <div>{{name}}</div>
    {{/each}}
    {{/if}}
    <!-- /SECTION:CERTIFICATIONS -->

    <!-- SECTION:AWARDS -->
    {{#if cv.awards}}
    {{#each cv.awards}}
    <div>{{name}}</div>
    {{/each}}
    {{/if}}
    <!-- /SECTION:AWARDS -->
    
    <!-- SECTION:PROJECTS -->
    {{#if projects}}
    {{#each projects}}
    <div>{{name}}</div>
    {{/each}}
    {{/if}}
    <!-- /SECTION:PROJECTS -->
  `;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PortfolioService,
        {
          provide: getRepositoryToken(PortfolioEntity),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn().mockResolvedValue([]),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findById: jest.fn().mockResolvedValue(mockUser),
          },
        },
        {
          provide: CvService,
          useValue: {
            getUserCvs: jest.fn().mockResolvedValue([mockCv]),
          },
        },
        {
          provide: ProjectsService,
          useValue: {
            getProjectsForPortfolio: jest.fn().mockResolvedValue(mockProjects),
          },
        },
        {
          provide: TemplateLoaderService,
          useValue: {
            loadTemplate: jest.fn().mockResolvedValue(mockTemplate),
          },
        },
        {
          provide: RedisService,
          useValue: {
            get: jest.fn().mockResolvedValue(null),
            set: jest.fn(),
            del: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<PortfolioService>(PortfolioService);
    portfolioRepository = module.get<Repository<PortfolioEntity>>(
      getRepositoryToken(PortfolioEntity),
    );
    usersService = module.get<UsersService>(UsersService);
    cvService = module.get<CvService>(CvService);
    projectsService = module.get<ProjectsService>(ProjectsService);
    templateLoaderService = module.get<TemplateLoaderService>(
      TemplateLoaderService,
    );
    redisService = module.get<RedisService>(RedisService);
  });

  describe('generatePortfolio', () => {
    it('should generate portfolio with default template sections', async () => {
      const createPortfolioDto = {
        template: PortfolioTemplate.BASIC,
        bio: 'Software Engineer',
      };

      const result = await service.generatePortfolio(
        'user-1',
        createPortfolioDto,
      );

      expect(result).toBeDefined();
      expect(result.user.name).toBe('John Doe');
      expect(result.user.bio).toBe('Software Engineer');
      expect(result.cv.summary).toBe('Experienced developer');
      expect(result.cv.skills).toBeDefined();
      expect(result.cv.skills.technical).toEqual([
        'JavaScript',
        'TypeScript',
        'React',
      ]);
      expect(result.projects).toEqual(mockProjects);
      expect(result.sections).toBeDefined();
    });

    it('should use selected CV when selectedCvId is provided', async () => {
      const anotherCv = { ...mockCv, id: 'cv-2' };
      jest
        .spyOn(cvService, 'getUserCvs')
        .mockResolvedValue([mockCv, anotherCv]);

      const createPortfolioDto = {
        template: PortfolioTemplate.BASIC,
        selectedCvId: 'cv-2',
      };

      const result = await service.generatePortfolio(
        'user-1',
        createPortfolioDto,
      );

      expect(result).toBeDefined();
      expect(result.selectedCvId).toBe('cv-2');
    });

    it('should merge custom sections with template defaults', async () => {
      const createPortfolioDto = {
        template: PortfolioTemplate.CREATIVE,
        customSections: {
          experience: true, // Creative template has experience=false by default
          education: true,
        },
      };

      const result = await service.generatePortfolio(
        'user-1',
        createPortfolioDto,
      );

      expect(result.sections.experience).toBe(true);
      expect(result.sections.education).toBe(true);
    });

    it('should exclude sections when set to false in sections config', async () => {
      const createPortfolioDto = {
        template: PortfolioTemplate.CREATIVE, // Has experience=false
      };

      const result = await service.generatePortfolio(
        'user-1',
        createPortfolioDto,
      );

      expect(result.cv.experience).toBeUndefined();
    });

    it('should include certifications and awards for MUHAMMAD_ISMAIL template', async () => {
      const createPortfolioDto = {
        template: PortfolioTemplate.MUHAMMAD_ISMAIL,
      };

      const result = await service.generatePortfolio(
        'user-1',
        createPortfolioDto,
      );

      expect(result.cv.certifications).toBeDefined();
      expect(result.cv.awards).toBeDefined();
    });

    it('should exclude certifications and awards for other templates', async () => {
      const createPortfolioDto = {
        template: PortfolioTemplate.BASIC,
      };

      const result = await service.generatePortfolio(
        'user-1',
        createPortfolioDto,
      );

      expect(result.cv.certifications).toBeUndefined();
      expect(result.cv.awards).toBeUndefined();
    });
    it('should fall back to CV projects when module projects are empty', async () => {
      jest
        .spyOn(projectsService, 'getProjectsForPortfolio')
        .mockResolvedValue([]);

      const createPortfolioDto = {
        template: PortfolioTemplate.BASIC,
      };

      const result = await service.generatePortfolio(
        'user-1',
        createPortfolioDto,
      );

      expect(result.projects).toEqual([
        expect.objectContaining({
          name: 'CV Portfolio App',
          techStack: ['Next.js', 'Nest.js'],
          demoLink: 'https://example.com',
        }),
      ]);
    });

    it('should use CV contact socials when form fields are empty', async () => {
      const createPortfolioDto = {
        template: PortfolioTemplate.BASIC,
      };

      const result = await service.generatePortfolio(
        'user-1',
        createPortfolioDto,
      );

      expect(result.user.linkedinUrl).toBe('https://linkedin.com/in/dai');
      expect(result.user.githubUrl).toBe('https://github.com/dai');
      expect(result.user.bio).toBe('Experienced developer');
    });
  });

  describe('Section Rendering', () => {
    it('should remove disabled sections from HTML', async () => {
      const portfolioData: any = {
        user: mockUser,
        cv: { skills: mockCv.parsedData.skills },
        projects: mockProjects,
        template: PortfolioTemplate.CREATIVE,
        sections: {
          hero: true,
          about: false, // Disabled
          skills: true,
          experience: false, // Disabled
          education: false,
          projects: true,
          certifications: false,
          awards: false,
          contact: true,
        },
      };

      const html = await service.generatePortfolioHTML(portfolioData);

      // Should not contain ABOUT section
      expect(html).not.toContain('<!-- SECTION:ABOUT -->');
      expect(html).not.toContain('Experienced developer');

      // Should not contain EXPERIENCE section
      expect(html).not.toContain('<!-- SECTION:EXPERIENCE -->');
      expect(html).not.toContain('Senior Developer');

      // Should contain HERO section
      expect(html).toContain('John Doe');

      // Should contain SKILLS section
      expect(html).toContain('JavaScript');

      // Should contain PROJECTS section
      expect(html).toContain('E-commerce Platform');
    });

    it('should render all sections when enabled', async () => {
      const portfolioData: any = {
        user: { ...mockUser, bio: 'Software Engineer' },
        cv: mockCv.parsedData,
        projects: mockProjects,
        template: PortfolioTemplate.BASIC,
        sections: {
          hero: true,
          about: true,
          skills: true,
          experience: true,
          education: true,
          projects: true,
          certifications: false,
          awards: false,
          contact: true,
        },
      };

      const html = await service.generatePortfolioHTML(portfolioData);

      expect(html).toContain('John Doe');
      expect(html).toContain('Experienced developer');
      expect(html).toContain('JavaScript');
      expect(html).toContain('Senior Developer');
      expect(html).toContain('Lead team');
      expect(html).toContain('E-commerce Platform');
    });

    it('should render CV field names (title, responsibilities, award title)', async () => {
      const portfolioData: any = {
        user: { ...mockUser, bio: 'Software Engineer' },
        cv: mockCv.parsedData,
        projects: service['resolvePortfolioProjects'](
          [],
          mockCv.parsedData.projects,
        ),
        template: PortfolioTemplate.BASIC,
        sections: {
          hero: true,
          about: true,
          skills: true,
          experience: true,
          education: true,
          projects: true,
          certifications: true,
          awards: true,
          contact: true,
        },
      };

      const html = await service.generatePortfolioHTML(portfolioData);

      expect(html).toContain('Senior Developer');
      expect(html).toContain('Lead team');
      expect(html).toContain('Shipped v2 platform');
      expect(html).toContain('Best Developer');
      expect(html).toContain('https://aws.amazon.com/cert');
      expect(html).toContain('CV Portfolio App');
    });

    it('should handle empty data gracefully', async () => {
      const portfolioData: any = {
        user: { name: 'John Doe', email: 'john@example.com' },
        cv: {
          skills: { technical: [], soft: [], languages: [], tools: [] },
          experience: [],
          education: [],
        },
        projects: [],
        template: PortfolioTemplate.BASIC,
        sections: {
          hero: true,
          about: true,
          skills: true,
          experience: true,
          education: true,
          projects: true,
          certifications: false,
          awards: false,
          contact: true,
        },
      };

      const html = await service.generatePortfolioHTML(portfolioData);

      expect(html).toBeDefined();
      expect(html).toContain('John Doe');
    });
  });

  describe('public username', () => {
    const dto = { template: PortfolioTemplate.BASIC, bio: 'Software Engineer' };

    beforeEach(() => {
      process.env.BACKEND_URL = 'http://backend.test';
      jest.spyOn(portfolioRepository, 'create').mockImplementation(
        (value) => value as PortfolioEntity,
      );
      jest
        .spyOn(portfolioRepository, 'save')
        .mockImplementation(async (value) => value as PortfolioEntity);
    });

    it('keeps the email local-part when nobody else publishes it', async () => {
      jest.spyOn(portfolioRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(portfolioRepository, 'find').mockResolvedValue([]);

      const saved = await service.savePortfolio('user-1', dto);

      expect(saved.username).toBe('john');
      expect(saved.generatedUrl).toBe('http://backend.test/portfolio/john');
    });

    it('does not reuse a slug another account already published', async () => {
      jest.spyOn(portfolioRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(portfolioRepository, 'find').mockImplementation(async (options) => {
        const username = (options as { where?: { username?: string } })?.where
          ?.username;
        if (username === 'john') {
          return [
            {
              id: 'other-portfolio',
              userId: 'user-2',
              username: 'john',
              isActive: true,
            },
          ] as PortfolioEntity[];
        }
        return [];
      });

      const saved = await service.savePortfolio('user-1', dto);

      expect(saved.username).toBe('john-user1');
      expect(saved.generatedUrl).toBe(
        'http://backend.test/portfolio/john-user1',
      );
      expect(saved.generatedHtml).toContain('John Doe');
      expect(saved.generatedHtml).not.toContain('Other Person');
    });

    it('refuses a shared slug instead of serving the other resume', async () => {
      jest.spyOn(redisService, 'get').mockResolvedValue('<html>other-resume</html>');
      jest.spyOn(portfolioRepository, 'find').mockResolvedValue([
        {
          id: 'older',
          userId: 'user-1',
          username: 'john',
          isActive: true,
          generatedHtml: '<html>first</html>',
          createdAt: new Date('2026-01-01'),
        },
        {
          id: 'newer',
          userId: 'user-2',
          username: 'john',
          isActive: true,
          generatedHtml: '<html>second</html>',
          createdAt: new Date('2026-02-01'),
        },
      ] as PortfolioEntity[]);

      await expect(service.getPublicHtmlByUsername('john')).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(redisService.get).not.toHaveBeenCalled();
      expect(redisService.del).toHaveBeenCalledWith(
        RedisKey.portfolioHtml('john'),
      );
    });
  });
});
