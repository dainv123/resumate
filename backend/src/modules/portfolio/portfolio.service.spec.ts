import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PortfolioService } from './portfolio.service';
import { Portfolio as PortfolioEntity } from './entities/portfolio.entity';
import { UsersService } from '../users/users.service';
import { CvService } from '../cv/cv.service';
import { ProjectsService } from '../projects/projects.service';
import { TemplateLoaderService } from './templates/template-loader.service';
import { PortfolioTemplate } from './dto/portfolio.dto';

describe('PortfolioService', () => {
  let service: PortfolioService;
  let portfolioRepository: Repository<PortfolioEntity>;
  let usersService: UsersService;
  let cvService: CvService;
  let projectsService: ProjectsService;
  let templateLoaderService: TemplateLoaderService;

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
      certifications: [
        {
          name: 'AWS Certified',
          issuer: 'Amazon',
          date: '2022',
        },
      ],
      awards: [
        {
          name: 'Best Developer',
          issuer: 'Tech Corp',
          date: '2022',
        },
      ],
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
    {{#each cv.skills.technical}}
    <span>{{this}}</span>
    {{/each}}
    <!-- /SECTION:SKILLS -->
    
    <!-- SECTION:EXPERIENCE -->
    {{#each cv.experience}}
    <div>{{title}} at {{company}}</div>
    {{/each}}
    <!-- /SECTION:EXPERIENCE -->
    
    <!-- SECTION:PROJECTS -->
    {{#each projects}}
    <div>{{name}}</div>
    {{/each}}
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
      ],
    }).compile();

    service = module.get<PortfolioService>(service);
    portfolioRepository = module.get<Repository<PortfolioEntity>>(
      getRepositoryToken(PortfolioEntity),
    );
    usersService = module.get<UsersService>(UsersService);
    cvService = module.get<CvService>(CvService);
    projectsService = module.get<ProjectsService>(ProjectsService);
    templateLoaderService = module.get<TemplateLoaderService>(TemplateLoaderService);
  });

  describe('generatePortfolio', () => {
    it('should generate portfolio with default template sections', async () => {
      const createPortfolioDto = {
        template: PortfolioTemplate.BASIC,
        bio: 'Software Engineer',
      };

      const result = await service.generatePortfolio('user-1', createPortfolioDto);

      expect(result).toBeDefined();
      expect(result.user.name).toBe('John Doe');
      expect(result.user.bio).toBe('Software Engineer');
      expect(result.cv.summary).toBe('Experienced developer');
      expect(result.cv.skills).toBeDefined();
      expect(result.cv.skills.technical).toEqual(['JavaScript', 'TypeScript', 'React']);
      expect(result.projects).toEqual(mockProjects);
      expect(result.sections).toBeDefined();
    });

    it('should use selected CV when selectedCvId is provided', async () => {
      const anotherCv = { ...mockCv, id: 'cv-2' };
      jest.spyOn(cvService, 'getUserCvs').mockResolvedValue([mockCv, anotherCv]);

      const createPortfolioDto = {
        template: PortfolioTemplate.BASIC,
        selectedCvId: 'cv-2',
      };

      const result = await service.generatePortfolio('user-1', createPortfolioDto);

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

      const result = await service.generatePortfolio('user-1', createPortfolioDto);

      expect(result.sections.experience).toBe(true);
      expect(result.sections.education).toBe(true);
    });

    it('should exclude sections when set to false in sections config', async () => {
      const createPortfolioDto = {
        template: PortfolioTemplate.CREATIVE, // Has experience=false
      };

      const result = await service.generatePortfolio('user-1', createPortfolioDto);

      expect(result.cv.experience).toBeUndefined();
    });

    it('should include certifications and awards for MUHAMMAD_ISMAIL template', async () => {
      const createPortfolioDto = {
        template: PortfolioTemplate.MUHAMMAD_ISMAIL,
      };

      const result = await service.generatePortfolio('user-1', createPortfolioDto);

      expect(result.cv.certifications).toBeDefined();
      expect(result.cv.awards).toBeDefined();
    });

    it('should exclude certifications and awards for other templates', async () => {
      const createPortfolioDto = {
        template: PortfolioTemplate.BASIC,
      };

      const result = await service.generatePortfolio('user-1', createPortfolioDto);

      expect(result.cv.certifications).toBeUndefined();
      expect(result.cv.awards).toBeUndefined();
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
      expect(html).toContain('E-commerce Platform');
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
});

