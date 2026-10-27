import {
  CVData,
  ContactInfo,
  Experience,
  Education,
  Project,
  Skills,
  TemplateConfig,
} from './cv-data.interface';

describe('CV Data Interfaces', () => {
  describe('ContactInfo', () => {
    it('should have required fields', () => {
      const contact: ContactInfo = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        address: '123 Main St',
        linkedin: 'https://linkedin.com/in/johndoe',
        github: 'https://github.com/johndoe',
        website: 'https://johndoe.com',
        location: 'San Francisco, CA',
      };

      expect(contact.name).toBe('John Doe');
      expect(contact.email).toBe('john@example.com');
      expect(contact.phone).toBe('+1234567890');
      expect(contact.address).toBe('123 Main St');
      expect(contact.linkedin).toBe('https://linkedin.com/in/johndoe');
      expect(contact.github).toBe('https://github.com/johndoe');
      expect(contact.website).toBe('https://johndoe.com');
      expect(contact.location).toBe('San Francisco, CA');
    });

    it('should allow optional fields to be undefined', () => {
      const contact: ContactInfo = {
        name: 'John Doe',
        email: 'john@example.com',
      };

      expect(contact.phone).toBeUndefined();
      expect(contact.address).toBeUndefined();
      expect(contact.linkedin).toBeUndefined();
      expect(contact.github).toBeUndefined();
      expect(contact.website).toBeUndefined();
      expect(contact.location).toBeUndefined();
    });
  });

  describe('Skills', () => {
    it('should have all skill categories', () => {
      const skills: Skills = {
        technical: ['JavaScript', 'TypeScript', 'React', 'Node.js'],
        tools: ['Git', 'Docker', 'AWS', 'Kubernetes'],
        languages: ['English', 'Spanish', 'French'],
        soft: ['Leadership', 'Communication', 'Problem Solving'],
      };

      expect(skills.technical).toHaveLength(4);
      expect(skills.tools).toHaveLength(4);
      expect(skills.languages).toHaveLength(3);
      expect(skills.soft).toHaveLength(3);
    });

    it('should allow empty arrays', () => {
      const skills: Skills = {
        technical: [],
        tools: [],
        languages: [],
        soft: [],
      };

      expect(skills.technical).toEqual([]);
      expect(skills.tools).toEqual([]);
      expect(skills.languages).toEqual([]);
      expect(skills.soft).toEqual([]);
    });
  });

  describe('Experience', () => {
    it('should have all required fields', () => {
      const experience: Experience = {
        id: 'exp_1',
        title: 'Senior Developer',
        company: 'Tech Corp',
        location: 'San Francisco, CA',
        startDate: '2020-01',
        endDate: '2023-12',
        current: false,
        description: 'Led development of web applications',
        responsibilities: [
          'Architecture design',
          'Code review',
          'Team mentoring',
        ],
        achievements: ['Improved performance by 50%', 'Reduced bugs by 70%'],
        technologies: ['React', 'TypeScript', 'Node.js', 'AWS'],
        teamSize: 8,
        companyDescription: 'Leading technology company',
      };

      expect(experience.id).toBe('exp_1');
      expect(experience.title).toBe('Senior Developer');
      expect(experience.company).toBe('Tech Corp');
      expect(experience.location).toBe('San Francisco, CA');
      expect(experience.startDate).toBe('2020-01');
      expect(experience.endDate).toBe('2023-12');
      expect(experience.current).toBe(false);
      expect(experience.description).toBe(
        'Led development of web applications',
      );
      expect(experience.responsibilities).toHaveLength(3);
      expect(experience.achievements).toHaveLength(2);
      expect(experience.technologies).toHaveLength(4);
      expect(experience.teamSize).toBe(8);
      expect(experience.companyDescription).toBe('Leading technology company');
    });

    it('should allow optional fields to be undefined', () => {
      const experience: Experience = {
        title: 'Developer',
        company: 'Startup',
        startDate: '2023-01',
        endDate: '',
        current: true,
        responsibilities: [],
        achievements: [],
        technologies: [],
      };

      expect(experience.id).toBeUndefined();
      expect(experience.location).toBeUndefined();
      expect(experience.description).toBeUndefined();
      expect(experience.teamSize).toBeUndefined();
      expect(experience.companyDescription).toBeUndefined();
    });
  });

  describe('Education', () => {
    it('should have all required fields', () => {
      const education: Education = {
        id: 'edu_1',
        institution: 'Stanford University',
        degree: 'Master of Science',
        field: 'Computer Science',
        startDate: '2018-09',
        endDate: '2020-06',
        gpa: '3.9',
        description: 'Focus on AI and Machine Learning',
        location: 'Stanford, CA',
      };

      expect(education.id).toBe('edu_1');
      expect(education.institution).toBe('Stanford University');
      expect(education.degree).toBe('Master of Science');
      expect(education.field).toBe('Computer Science');
      expect(education.startDate).toBe('2018-09');
      expect(education.endDate).toBe('2020-06');
      expect(education.gpa).toBe('3.9');
      expect(education.description).toBe('Focus on AI and Machine Learning');
      expect(education.location).toBe('Stanford, CA');
    });

    it('should allow optional fields to be undefined', () => {
      const education: Education = {
        institution: 'University',
        degree: 'Bachelor of Science',
        startDate: '2014-09',
        endDate: '2018-06',
      };

      expect(education.id).toBeUndefined();
      expect(education.field).toBeUndefined();
      expect(education.gpa).toBeUndefined();
      expect(education.description).toBeUndefined();
      expect(education.location).toBeUndefined();
    });
  });

  describe('Project', () => {
    it('should have all required fields', () => {
      const project: Project = {
        id: 'proj_1',
        name: 'E-commerce Platform',
        description:
          'Full-stack e-commerce application with AI recommendations',
        startDate: '2023-01',
        endDate: '2023-06',
        technologies: ['React', 'Node.js', 'MongoDB', 'AWS'],
        role: 'Lead Developer',
        teamSize: 5,
        results: ['50% increase in sales', '30% reduction in cart abandonment'],
        link: 'https://ecommerce.example.com',
        repository: 'https://github.com/company/ecommerce',
        duration: '6 months',
      };

      expect(project.id).toBe('proj_1');
      expect(project.name).toBe('E-commerce Platform');
      expect(project.description).toBe(
        'Full-stack e-commerce application with AI recommendations',
      );
      expect(project.startDate).toBe('2023-01');
      expect(project.endDate).toBe('2023-06');
      expect(project.technologies).toHaveLength(4);
      expect(project.role).toBe('Lead Developer');
      expect(project.teamSize).toBe(5);
      expect(project.results).toHaveLength(2);
      expect(project.link).toBe('https://ecommerce.example.com');
      expect(project.repository).toBe('https://github.com/company/ecommerce');
      expect(project.duration).toBe('6 months');
    });

    it('should allow optional fields to be undefined', () => {
      const project: Project = {
        name: 'Simple App',
        description: 'Basic application',
        startDate: '2023-01',
        endDate: '2023-03',
        technologies: ['React'],
      };

      expect(project.id).toBeUndefined();
      expect(project.role).toBeUndefined();
      expect(project.teamSize).toBeUndefined();
      expect(project.results).toBeUndefined();
      expect(project.link).toBeUndefined();
      expect(project.repository).toBeUndefined();
      expect(project.duration).toBeUndefined();
    });
  });

  describe('TemplateConfig', () => {
    it('should have all required fields', () => {
      const config: TemplateConfig = {
        layout: 'two-column',
        sections: {
          contact: true,
          summary: true,
          experience: true,
          education: true,
          skills: true,
          projects: true,
          certifications: true,
          awards: true,
          publications: true,
          volunteer: true,
          languages: true,
        },
        styling: {
          primaryColor: '#2563eb',
          secondaryColor: '#1e40af',
          fontFamily: 'Inter, sans-serif',
          fontSize: 'large',
        },
      };

      expect(config.layout).toBe('two-column');
      expect(config.sections.contact).toBe(true);
      expect(config.sections.summary).toBe(true);
      expect(config.sections.experience).toBe(true);
      expect(config.sections.education).toBe(true);
      expect(config.sections.skills).toBe(true);
      expect(config.sections.projects).toBe(true);
      expect(config.sections.certifications).toBe(true);
      expect(config.sections.awards).toBe(true);
      expect(config.sections.publications).toBe(true);
      expect(config.sections.volunteer).toBe(true);
      expect(config.sections.languages).toBe(true);

      expect(config.styling.primaryColor).toBe('#2563eb');
      expect(config.styling.secondaryColor).toBe('#1e40af');
      expect(config.styling.fontFamily).toBe('Inter, sans-serif');
      expect(config.styling.fontSize).toBe('large');
    });

    it('should support different layout options', () => {
      const singleColumn: TemplateConfig = {
        layout: 'single-column',
        sections: {
          contact: true,
          summary: true,
          experience: true,
          education: true,
          skills: true,
          projects: true,
          certifications: true,
          awards: true,
          publications: true,
          volunteer: true,
          languages: true,
        },
        styling: {
          primaryColor: '#2c3e50',
          secondaryColor: '#34495e',
          fontFamily: 'Arial, sans-serif',
          fontSize: 'medium',
        },
      };

      const modern: TemplateConfig = {
        layout: 'modern',
        sections: {
          contact: true,
          summary: true,
          experience: true,
          education: true,
          skills: true,
          projects: true,
          certifications: true,
          awards: true,
          publications: true,
          volunteer: true,
          languages: true,
        },
        styling: {
          primaryColor: '#e74c3c',
          secondaryColor: '#2c3e50',
          fontFamily: 'Helvetica, Arial, sans-serif',
          fontSize: 'small',
        },
      };

      expect(singleColumn.layout).toBe('single-column');
      expect(modern.layout).toBe('modern');
    });

    it('should support different font sizes', () => {
      const smallFont: TemplateConfig = {
        layout: 'single-column',
        sections: {
          contact: true,
          summary: true,
          experience: true,
          education: true,
          skills: true,
          projects: true,
          certifications: true,
          awards: true,
          publications: true,
          volunteer: true,
          languages: true,
        },
        styling: {
          primaryColor: '#2c3e50',
          secondaryColor: '#34495e',
          fontFamily: 'Arial, sans-serif',
          fontSize: 'small',
        },
      };

      const largeFont: TemplateConfig = {
        layout: 'single-column',
        sections: {
          contact: true,
          summary: true,
          experience: true,
          education: true,
          skills: true,
          projects: true,
          certifications: true,
          awards: true,
          publications: true,
          volunteer: true,
          languages: true,
        },
        styling: {
          primaryColor: '#2c3e50',
          secondaryColor: '#34495e',
          fontFamily: 'Arial, sans-serif',
          fontSize: 'large',
        },
      };

      expect(smallFont.styling.fontSize).toBe('small');
      expect(largeFont.styling.fontSize).toBe('large');
    });
  });

  describe('CVData', () => {
    it('should have all required fields', () => {
      const cvData: CVData = {
        id: 'cv_1',
        version: '1.0',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
        lastModified: '2023-01-01T00:00:00Z',
        contact: {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890',
        },
        summary: 'Experienced full-stack developer',
        experience: [
          {
            title: 'Senior Developer',
            company: 'Tech Corp',
            startDate: '2020-01',
            endDate: '',
            current: true,
            responsibilities: ['Lead development'],
            achievements: ['Improved performance'],
            technologies: ['React', 'Node.js'],
          },
        ],
        education: [
          {
            institution: 'University',
            degree: 'Computer Science',
            startDate: '2018-09',
            endDate: '2020-06',
          },
        ],
        skills: {
          technical: ['JavaScript', 'Python'],
          tools: ['Git', 'Docker'],
          languages: ['English'],
          soft: ['Leadership'],
        },
        projects: [
          {
            name: 'E-commerce App',
            description: 'Full-stack application',
            startDate: '2023-01',
            endDate: '2023-06',
            technologies: ['React', 'Node.js'],
          },
        ],
        template: {
          layout: 'single-column',
          sections: {
            contact: true,
            summary: true,
            experience: true,
            education: true,
            skills: true,
            projects: true,
            certifications: true,
            awards: true,
            publications: true,
            volunteer: true,
            languages: true,
          },
          styling: {
            primaryColor: '#2c3e50',
            secondaryColor: '#34495e',
            fontFamily: 'Arial, sans-serif',
            fontSize: 'medium',
          },
        },
      };

      expect(cvData.id).toBe('cv_1');
      expect(cvData.version).toBe('1.0');
      expect(cvData.createdAt).toBe('2023-01-01T00:00:00Z');
      expect(cvData.updatedAt).toBe('2023-01-01T00:00:00Z');
      expect(cvData.lastModified).toBe('2023-01-01T00:00:00Z');
      expect(cvData.contact).toBeDefined();
      expect(cvData.summary).toBe('Experienced full-stack developer');
      expect(cvData.experience).toHaveLength(1);
      expect(cvData.education).toHaveLength(1);
      expect(cvData.skills).toBeDefined();
      expect(cvData.projects).toHaveLength(1);
      expect(cvData.template).toBeDefined();
    });

    it('should allow optional sections to be undefined', () => {
      const cvData: CVData = {
        contact: {
          name: 'John Doe',
          email: 'john@example.com',
        },
        summary: 'Developer',
        experience: [],
        education: [],
        skills: {
          technical: [],
          tools: [],
          languages: [],
          soft: [],
        },
        projects: [],
      };

      expect(cvData.id).toBeUndefined();
      expect(cvData.version).toBeUndefined();
      expect(cvData.createdAt).toBeUndefined();
      expect(cvData.updatedAt).toBeUndefined();
      expect(cvData.lastModified).toBeUndefined();
      expect(cvData.certifications).toBeUndefined();
      expect(cvData.awards).toBeUndefined();
      expect(cvData.publications).toBeUndefined();
      expect(cvData.volunteer).toBeUndefined();
      expect(cvData.languages).toBeUndefined();
      expect(cvData.customSections).toBeUndefined();
      expect(cvData.template).toBeUndefined();
    });
  });
});
