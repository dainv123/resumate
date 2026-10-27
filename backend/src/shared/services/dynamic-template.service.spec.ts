import { DynamicTemplateService } from './dynamic-template.service';
import { CVData, TemplateConfig } from '../interfaces/cv-data.interface';

describe('DynamicTemplateService', () => {
  let service: DynamicTemplateService;

  beforeEach(() => {
    service = new DynamicTemplateService();
  });

  describe('detectAvailableSections', () => {
    it('should detect all sections with data', () => {
      const cvData: CVData = {
        contact: {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890',
        },
        summary: 'Experienced developer',
        experience: [
          {
            title: 'Senior Developer',
            company: 'Tech Corp',
            startDate: '2020',
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
            startDate: '2018',
            endDate: '2020',
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
            startDate: '2023',
            endDate: '2023',
            technologies: ['React', 'Node.js'],
          },
        ],
        certifications: [
          {
            name: 'AWS Certified',
            issuer: 'Amazon',
            date: '2023',
          },
        ],
        awards: [
          {
            title: 'Best Developer',
            issuer: 'Company',
            date: '2023',
          },
        ],
        publications: [
          {
            title: 'AI in Web Development',
            authors: ['John Doe'],
            publicationDate: '2023',
          },
        ],
        volunteer: [
          {
            organization: 'Tech for Good',
            role: 'Volunteer Developer',
            startDate: '2022',
            endDate: '',
            current: true,
            description: 'Helping non-profits with technology',
            responsibilities: ['Build websites'],
            achievements: ['Helped 5 organizations'],
          },
        ],
      };

      const sections = service.detectAvailableSections(cvData);

      expect(sections).toHaveLength(10);
      expect(sections.map((s) => s.title)).toEqual([
        'Contact',
        'Summary',
        'Experience',
        'Education',
        'Skills',
        'Projects',
        'Certifications',
        'Awards',
        'Publications',
        'Volunteer Experience',
      ]);

      sections.forEach((section) => {
        expect(section.hasData).toBe(true);
        expect(section.content).toBeTruthy();
        expect(section.priority).toBeGreaterThan(0);
      });
    });

    it('should detect only sections with data by default', () => {
      const cvData: CVData = {
        contact: {
          name: 'John Doe',
          email: 'john@example.com',
        },
        summary: 'Developer',
        experience: [],
        education: [],
        skills: {
          technical: ['JavaScript'],
          tools: [],
          languages: [],
          soft: [],
        },
        projects: [],
      };

      const sections = service.detectAvailableSections(cvData);

      expect(sections).toHaveLength(4);
      expect(sections.map((s) => s.title)).toEqual([
        'Contact',
        'Summary',
        'Skills',
        'Experience',
      ]);
    });

    it('should include empty sections when showEmptySections is true', () => {
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

      const sections = service.detectAvailableSections(cvData, true);

      expect(sections.length).toBeGreaterThan(4);
      expect(
        sections.some((s) => s.title === 'Certifications' && !s.hasData),
      ).toBe(true);
      expect(sections.some((s) => s.title === 'Awards' && !s.hasData)).toBe(
        true,
      );
      expect(
        sections.some((s) => s.title === 'Publications' && !s.hasData),
      ).toBe(true);
      expect(
        sections.some((s) => s.title === 'Volunteer Experience' && !s.hasData),
      ).toBe(true);
    });

    it('should prioritize sections correctly', () => {
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

      const sections = service.detectAvailableSections(cvData);

      expect(sections[0].title).toBe('Contact');
      expect(sections[0].priority).toBe(1);
      expect(sections[1].title).toBe('Summary');
      expect(sections[1].priority).toBe(2);
    });
  });

  describe('generateDynamicTemplate', () => {
    it('should generate HTML template with all sections', () => {
      const cvData: CVData = {
        contact: {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890',
        },
        summary: 'Experienced developer',
        experience: [
          {
            title: 'Senior Developer',
            company: 'Tech Corp',
            startDate: '2020',
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
            startDate: '2018',
            endDate: '2020',
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
            startDate: '2023',
            endDate: '2023',
            technologies: ['React', 'Node.js'],
          },
        ],
      };

      const config: TemplateConfig = {
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

      const html = service.generateDynamicTemplate(cvData, config);

      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<html lang="en">');
      expect(html).toContain('<head>');
      expect(html).toContain('<title>John Doe - Resume</title>');
      expect(html).toContain('<body class="single-column">');
      expect(html).toContain('John Doe');
      expect(html).toContain('john@example.com');
      expect(html).toContain('Experienced developer');
      expect(html).toContain('Senior Developer');
      expect(html).toContain('Tech Corp');
      expect(html).toContain('University');
      expect(html).toContain('Computer Science');
      expect(html).toContain('JavaScript');
      expect(html).toContain('Python');
      expect(html).toContain('E-commerce App');
    });

    it('should generate two-column layout', () => {
      const cvData: CVData = {
        contact: {
          name: 'John Doe',
          email: 'john@example.com',
        },
        summary: 'Developer',
        experience: [],
        education: [],
        skills: {
          technical: ['JavaScript'],
          tools: [],
          languages: [],
          soft: [],
        },
        projects: [],
      };

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
          primaryColor: '#2c3e50',
          secondaryColor: '#34495e',
          fontFamily: 'Arial, sans-serif',
          fontSize: 'medium',
        },
      };

      const html = service.generateDynamicTemplate(cvData, config);

      expect(html).toContain('<body class="two-column">');
      expect(html).toContain('left-column');
      expect(html).toContain('right-column');
    });

    it('should use default config when none provided', () => {
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

      const html = service.generateDynamicTemplate(
        cvData,
        {} as TemplateConfig,
      );

      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('John Doe');
    });
  });

  describe('getDefaultConfig', () => {
    it('should return default template configuration', () => {
      const config = service.getDefaultConfig();

      expect(config.layout).toBe('single-column');
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

      expect(config.styling.primaryColor).toBe('#2c3e50');
      expect(config.styling.secondaryColor).toBe('#34495e');
      expect(config.styling.fontFamily).toBe('Arial, sans-serif');
      expect(config.styling.fontSize).toBe('medium');
    });
  });

  describe('getTwoColumnConfig', () => {
    it('should return two-column configuration', () => {
      const config = service.getTwoColumnConfig();

      expect(config.layout).toBe('two-column');
      expect(config.styling.primaryColor).toBe('#3498db');
    });
  });

  describe('getModernConfig', () => {
    it('should return modern configuration', () => {
      const config = service.getModernConfig();

      expect(config.layout).toBe('single-column');
      expect(config.styling.primaryColor).toBe('#e74c3c');
      expect(config.styling.secondaryColor).toBe('#2c3e50');
      expect(config.styling.fontFamily).toBe('Helvetica, Arial, sans-serif');
    });
  });

  describe('getShowAllConfig', () => {
    it('should return show-all configuration', () => {
      const config = service.getShowAllConfig();

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
    });
  });

  describe('section generators', () => {
    const cvData: CVData = {
      contact: {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        linkedin: 'https://linkedin.com/in/johndoe',
        github: 'https://github.com/johndoe',
        website: 'https://johndoe.com',
      },
      summary: 'Experienced developer',
      experience: [
        {
          title: 'Senior Developer',
          company: 'Tech Corp',
          startDate: '2020',
          endDate: '',
          current: true,
          responsibilities: ['Lead development'],
          achievements: ['Improved performance'],
          technologies: ['React', 'Node.js'],
          teamSize: 5,
          companyDescription: 'Leading tech company',
        },
      ],
      education: [
        {
          institution: 'University',
          degree: 'Computer Science',
          startDate: '2018',
          endDate: '2020',
          gpa: '3.8',
          description: 'Focus on software engineering',
        },
      ],
      skills: {
        technical: ['JavaScript', 'Python'],
        tools: ['Git', 'Docker'],
        languages: ['English', 'Spanish'],
        soft: ['Leadership', 'Communication'],
      },
      projects: [
        {
          name: 'E-commerce App',
          description: 'Full-stack application',
          startDate: '2023',
          endDate: '2023',
          technologies: ['React', 'Node.js'],
          results: ['50% increase in sales'],
          link: 'https://ecommerce.example.com',
        },
      ],
      certifications: [
        {
          name: 'AWS Certified',
          issuer: 'Amazon',
          date: '2023',
          credentialUrl: 'https://aws.amazon.com/certification',
        },
      ],
      awards: [
        {
          title: 'Best Developer',
          issuer: 'Company',
          date: '2023',
        },
      ],
      publications: [
        {
          title: 'AI in Web Development',
          authors: ['John Doe', 'Jane Smith'],
          publicationDate: '2023',
          journal: 'Tech Journal',
        },
      ],
      volunteer: [
        {
          organization: 'Tech for Good',
          role: 'Volunteer Developer',
          startDate: '2022',
          endDate: '',
          current: true,
          description: 'Helping non-profits with technology',
          responsibilities: ['Build websites'],
          achievements: ['Helped 5 organizations'],
        },
      ],
    };

    it('should generate contact section', () => {
      const section = service
        .detectAvailableSections(cvData)
        .find((s) => s.title === 'Contact');
      expect(section?.content).toContain('John Doe');
      expect(section?.content).toContain('john@example.com');
      expect(section?.content).toContain('+1234567890');
      expect(section?.content).toContain('https://linkedin.com/in/johndoe');
      expect(section?.content).toContain('https://github.com/johndoe');
      expect(section?.content).toContain('https://johndoe.com');
    });

    it('should generate experience section', () => {
      const section = service
        .detectAvailableSections(cvData)
        .find((s) => s.title === 'Experience');
      expect(section?.content).toContain('Senior Developer');
      expect(section?.content).toContain('Tech Corp');
      expect(section?.content).toContain('Lead development');
      expect(section?.content).toContain('Improved performance');
      expect(section?.content).toContain('React');
      expect(section?.content).toContain('Node.js');
      expect(section?.content).toContain('Team Size: 5');
      expect(section?.content).toContain('Leading tech company');
    });

    it('should generate education section', () => {
      const section = service
        .detectAvailableSections(cvData)
        .find((s) => s.title === 'Education');
      expect(section?.content).toContain('University');
      expect(section?.content).toContain('Computer Science');
      expect(section?.content).toContain('Focus on software engineering');
      expect(section?.content).toContain('GPA: 3.8');
    });

    it('should generate skills section', () => {
      const section = service
        .detectAvailableSections(cvData)
        .find((s) => s.title === 'Skills');
      expect(section?.content).toContain('Technical Skills');
      expect(section?.content).toContain('JavaScript');
      expect(section?.content).toContain('Python');
      expect(section?.content).toContain('Soft Skills');
      expect(section?.content).toContain('Leadership');
      expect(section?.content).toContain('Communication');
      expect(section?.content).toContain('Languages');
      expect(section?.content).toContain('English');
      expect(section?.content).toContain('Spanish');
      expect(section?.content).toContain('Tools');
      expect(section?.content).toContain('Git');
      expect(section?.content).toContain('Docker');
    });

    it('should generate projects section', () => {
      const section = service
        .detectAvailableSections(cvData)
        .find((s) => s.title === 'Projects');
      expect(section?.content).toContain('E-commerce App');
      expect(section?.content).toContain('Full-stack application');
      expect(section?.content).toContain('React');
      expect(section?.content).toContain('Node.js');
      expect(section?.content).toContain('50% increase in sales');
      expect(section?.content).toContain('https://ecommerce.example.com');
    });

    it('should generate certifications section', () => {
      const section = service
        .detectAvailableSections(cvData)
        .find((s) => s.title === 'Certifications');
      expect(section?.content).toContain('AWS Certified');
      expect(section?.content).toContain('Amazon');
      expect(section?.content).toContain(
        'https://aws.amazon.com/certification',
      );
    });

    it('should generate awards section', () => {
      const section = service
        .detectAvailableSections(cvData)
        .find((s) => s.title === 'Awards');
      expect(section?.content).toContain('Best Developer');
      expect(section?.content).toContain('Company');
    });

    it('should generate publications section', () => {
      const section = service
        .detectAvailableSections(cvData)
        .find((s) => s.title === 'Publications');
      expect(section?.content).toContain('AI in Web Development');
      expect(section?.content).toContain('John Doe, Jane Smith');
      expect(section?.content).toContain('Tech Journal');
    });

    it('should generate volunteer section', () => {
      const section = service
        .detectAvailableSections(cvData)
        .find((s) => s.title === 'Volunteer Experience');
      expect(section?.content).toContain('Tech for Good');
      expect(section?.content).toContain('Volunteer Developer');
      expect(section?.content).toContain('Helping non-profits with technology');
      expect(section?.content).toContain('Build websites');
      expect(section?.content).toContain('Helped 5 organizations');
    });
  });
});
