import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProjectsService } from './projects.service';
import { Project } from './entities/project.entity';
import { Cv } from '../cv/entities/cv.entity';
import { AiService } from '../ai/ai.service';
import { UsersService } from '../users/users.service';

describe('ProjectsService CV project links', () => {
  let service: ProjectsService;
  let projectRepository: { findOne: jest.Mock; save: jest.Mock };
  let cvRepository: { findOne: jest.Mock; save: jest.Mock };

  const trackedProject = {
    id: 'project-1',
    userId: 'user-1',
    name: 'Inventory App',
    description: 'Side project tracker entry',
    techStack: ['Node.js', 'PostgreSQL'],
    results: 'Shipped v1',
    demoLink: 'https://demo.example',
    isAddedToCv: true,
  } as Project;

  const resumeProject = {
    name: 'Inventory App',
    description: 'Led the warehouse rewrite at Acme',
    techStack: ['Java'],
    results: 'Cut pick time by 30%',
    link: 'https://acme.example',
  };

  const addedProject = {
    name: trackedProject.name,
    description: trackedProject.description,
    techStack: trackedProject.techStack,
    results: trackedProject.results,
    link: trackedProject.demoLink,
  };

  beforeEach(async () => {
    projectRepository = {
      findOne: jest.fn().mockResolvedValue({ ...trackedProject }),
      save: jest.fn().mockImplementation(async (project) => project),
    };
    cvRepository = {
      findOne: jest.fn(),
      save: jest.fn().mockImplementation(async (cv) => cv),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        { provide: getRepositoryToken(Project), useValue: projectRepository },
        { provide: getRepositoryToken(Cv), useValue: cvRepository },
        { provide: AiService, useValue: {} },
        { provide: UsersService, useValue: {} },
      ],
    }).compile();

    service = module.get(ProjectsService);
  });

  it('removes only the tracked entry when the resume has the same project name', async () => {
    const cv = {
      id: 'cv-1',
      userId: 'user-1',
      version: 2,
      parsedData: {
        projects: [resumeProject, addedProject],
      },
    };
    cvRepository.findOne.mockResolvedValue(cv);

    const saved = await service.removeProjectFromCv('project-1', 'user-1', 'cv-1');

    expect(saved.parsedData.projects).toEqual([resumeProject]);
    expect(saved.version).toBe(3);
    expect(projectRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ isAddedToCv: false }),
    );
  });

  it('does not rewrite the CV when no tracked entry is present', async () => {
    const cv = {
      id: 'cv-1',
      userId: 'user-1',
      version: 1,
      parsedData: {
        projects: [resumeProject],
      },
    };
    cvRepository.findOne.mockResolvedValue(cv);

    const result = await service.removeProjectFromCv('project-1', 'user-1', 'cv-1');

    expect(result.parsedData.projects).toEqual([resumeProject]);
    expect(result.version).toBe(1);
    expect(cvRepository.save).not.toHaveBeenCalled();
    expect(projectRepository.save).not.toHaveBeenCalled();
  });

  it('adds a project when the CV has no projects array', async () => {
    const cv = {
      id: 'cv-1',
      userId: 'user-1',
      version: 1,
      parsedData: {
        name: 'Ada Lovelace',
      },
    };
    cvRepository.findOne.mockResolvedValue(cv);
    projectRepository.findOne.mockResolvedValue({
      ...trackedProject,
      isAddedToCv: false,
    });

    const saved = await service.addProjectToCv('project-1', 'user-1', { cvId: 'cv-1' });

    expect(saved.parsedData.projects).toEqual([addedProject]);
    expect(saved.parsedData.name).toBe('Ada Lovelace');
    expect(saved.version).toBe(2);
  });
});
