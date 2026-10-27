import { CVDataUtils } from './cv-data.utils';
import { DynamicTemplateService } from '../services/dynamic-template.service';
import { CVData, TemplateConfig } from '../interfaces/cv-data.interface';

describe('CV Data Integration Tests', () => {
  let templateService: DynamicTemplateService;

  beforeEach(() => {
    templateService = new DynamicTemplateService();
  });

  describe('End-to-End CV Data Flow', () => {
    it('should handle complete CV data flow from legacy to template generation', () => {
      // Step 1: Legacy CV data
      const legacyData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        address: '123 Main St, San Francisco, CA',
        linkedin: 'https://linkedin.com/in/johndoe',
        github: 'https://github.com/johndoe',
        website: 'https://johndoe.com',
        summary:
          'Experienced full-stack developer with 5+ years of experience in building scalable web applications.',
        experience: [
          {
            title: 'Senior Full-Stack Developer',
            company: 'TechCorp Inc.',
            duration: '2021 - Present',
            teamSize: '8',
            companyDescription:
              'Leading technology company specializing in AI solutions',
            responsibilities: [
              'Lead development of microservices architecture',
              'Mentor junior developers and conduct code reviews',
              'Collaborate with product managers and designers',
            ],
            achievements: [
              'Improved application performance by 60%',
              'Reduced deployment time by 40%',
              'Led team of 8 developers successfully',
            ],
            technologies: [
              'React',
              'TypeScript',
              'Node.js',
              'PostgreSQL',
              'AWS',
              'Docker',
            ],
          },
          {
            title: 'Full-Stack Developer',
            company: 'StartupXYZ',
            duration: '2019 - 2021',
            teamSize: '4',
            responsibilities: [
              'Developed responsive web applications',
              'Implemented RESTful APIs',
              'Optimized database queries',
            ],
            achievements: [
              'Built MVP in 3 months',
              'Increased user engagement by 35%',
            ],
            technologies: ['Vue.js', 'Express.js', 'MongoDB', 'Redis'],
          },
        ],
        education: [
          {
            degree: 'Master of Science in Computer Science',
            school: 'Stanford University',
            year: '2017 - 2019',
            gpa: '3.8',
            location: 'Stanford, CA',
            description:
              'Focus on Artificial Intelligence and Machine Learning',
          },
          {
            degree: 'Bachelor of Science in Software Engineering',
            school: 'UC Berkeley',
            year: '2013 - 2017',
            gpa: '3.6',
            location: 'Berkeley, CA',
          },
        ],
        skills: {
          technical: [
            'JavaScript',
            'TypeScript',
            'Python',
            'Java',
            'Go',
            'React',
            'Vue.js',
            'Angular',
            'Node.js',
            'Express.js',
            'PostgreSQL',
            'MongoDB',
            'Redis',
            'GraphQL',
            'REST APIs',
          ],
          tools: [
            'Git',
            'Docker',
            'Kubernetes',
            'AWS',
            'GCP',
            'Jenkins',
            'Jest',
            'Cypress',
            'Webpack',
            'Babel',
          ],
          languages: [
            'English (Native)',
            'Spanish (Fluent)',
            'French (Intermediate)',
          ],
          soft: [
            'Leadership',
            'Team Management',
            'Problem Solving',
            'Communication',
            'Agile/Scrum',
            'Mentoring',
          ],
        },
        projects: [
          {
            name: 'E-commerce Platform',
            description:
              'Full-stack e-commerce platform with AI-powered recommendations and real-time inventory management.',
            techStack: [
              'React',
              'TypeScript',
              'Node.js',
              'PostgreSQL',
              'Redis',
              'AWS',
            ],
            duration: '8 months',
            results: [
              '50% increase in conversion rate',
              '30% reduction in cart abandonment',
              '99.9% uptime achieved',
            ],
            link: 'https://ecommerce.example.com',
          },
          {
            name: 'AI Chatbot System',
            description:
              'Intelligent customer service chatbot using NLP and machine learning.',
            techStack: [
              'Python',
              'TensorFlow',
              'React',
              'FastAPI',
              'PostgreSQL',
            ],
            duration: '6 months',
            results: [
              '95% customer satisfaction rate',
              '60% reduction in support tickets',
              '24/7 automated customer support',
            ],
            link: 'https://chatbot.example.com',
          },
        ],
        certifications: [
          {
            name: 'AWS Certified Solutions Architect',
            issuer: 'Amazon Web Services',
            date: '2023',
            link: 'https://aws.amazon.com/certification',
          },
          {
            name: 'Google Cloud Professional Developer',
            issuer: 'Google Cloud',
            date: '2022',
            link: 'https://cloud.google.com/certification',
          },
        ],
        awards: [
          {
            name: 'Employee of the Year',
            issuer: 'TechCorp Inc.',
            date: '2023',
          },
          {
            name: 'Innovation Award',
            issuer: 'StartupXYZ',
            date: '2021',
          },
        ],
        publications: [
          {
            title: 'Building Scalable Microservices with Node.js',
            journal: 'IEEE Software',
            date: '2023',
            authors: 'John Doe, Jane Smith',
          },
        ],
        volunteer: [
          {
            role: 'Technical Mentor',
            organization: 'Code for Good',
            duration: '2022 - Present',
            description:
              'Mentoring aspiring developers from underrepresented communities',
            responsibilities: [
              'Conduct weekly coding sessions',
              'Review student projects',
              'Provide career guidance',
            ],
            achievements: [
              'Mentored 15+ students',
              'Helped 8 students land their first tech jobs',
            ],
          },
        ],
      };

      // Step 2: Normalize to standard structure
      const normalizedData = CVDataUtils.normalizeCVData(legacyData);

      // Verify normalization
      expect(normalizedData.contact).toEqual({
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        address: '123 Main St, San Francisco, CA',
        linkedin: 'https://linkedin.com/in/johndoe',
        github: 'https://github.com/johndoe',
        website: 'https://johndoe.com',
        location: '',
      });

      expect(normalizedData.experience).toHaveLength(2);
      expect(normalizedData.experience[0]).toEqual({
        id: 'exp_0',
        title: 'Senior Full-Stack Developer',
        company: 'TechCorp Inc.',
        location: '',
        startDate: '2021',
        endDate: '',
        current: true,
        description: '',
        responsibilities: [
          'Lead development of microservices architecture',
          'Mentor junior developers and conduct code reviews',
          'Collaborate with product managers and designers',
        ],
        achievements: [
          'Improved application performance by 60%',
          'Reduced deployment time by 40%',
          'Led team of 8 developers successfully',
        ],
        technologies: [
          'React',
          'TypeScript',
          'Node.js',
          'PostgreSQL',
          'AWS',
          'Docker',
        ],
        teamSize: 8,
        companyDescription:
          'Leading technology company specializing in AI solutions',
      });

      expect(normalizedData.education).toHaveLength(2);
      expect(normalizedData.education[0]).toEqual({
        id: 'edu_0',
        institution: 'Stanford University',
        degree: 'Master of Science in Computer Science',
        field: '',
        startDate: '2017',
        endDate: '2019',
        gpa: '3.8',
        description: 'Focus on Artificial Intelligence and Machine Learning',
        location: 'Stanford, CA',
      });

      // Step 3: Validate data
      const validation = CVDataUtils.validateCVData(normalizedData);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);

      // Step 4: Calculate completeness score
      const completenessScore =
        CVDataUtils.calculateCompletenessScore(normalizedData);
      expect(completenessScore).toBeGreaterThan(90);

      // Step 5: Detect available sections
      const sections = templateService.detectAvailableSections(normalizedData);
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

      // Step 6: Generate template with different configurations
      const singleColumnConfig = templateService.getDefaultConfig();
      const twoColumnConfig = templateService.getTwoColumnConfig();
      const modernConfig = templateService.getModernConfig();

      const singleColumnHtml = templateService.generateDynamicTemplate(
        normalizedData,
        singleColumnConfig,
      );
      const twoColumnHtml = templateService.generateDynamicTemplate(
        normalizedData,
        twoColumnConfig,
      );
      const modernHtml = templateService.generateDynamicTemplate(
        normalizedData,
        modernConfig,
      );

      // Verify all templates contain essential information
      [singleColumnHtml, twoColumnHtml, modernHtml].forEach((html) => {
        expect(html).toContain('John Doe');
        expect(html).toContain('john@example.com');
        expect(html).toContain('Experienced full-stack developer');
        expect(html).toContain('Senior Full-Stack Developer');
        expect(html).toContain('TechCorp Inc.');
        expect(html).toContain('Stanford University');
        expect(html).toContain('Master of Science in Computer Science');
        expect(html).toContain('JavaScript');
        expect(html).toContain('TypeScript');
        expect(html).toContain('E-commerce Platform');
        expect(html).toContain('AWS Certified Solutions Architect');
        expect(html).toContain('Employee of the Year');
        expect(html).toContain('Building Scalable Microservices');
        expect(html).toContain('Code for Good');
      });

      // Verify layout differences
      expect(singleColumnHtml).toContain('class="single-column"');
      expect(twoColumnHtml).toContain('class="two-column"');
      expect(modernHtml).toContain('class="single-column"');

      // Verify styling differences
      expect(twoColumnHtml).toContain('--primary-color: #3498db');
      expect(modernHtml).toContain('--primary-color: #e74c3c');
    });

    it('should handle minimal CV data gracefully', () => {
      const minimalData = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        summary: 'Developer',
      };

      const normalizedData = CVDataUtils.normalizeCVData(minimalData);

      expect(normalizedData.contact.name).toBe('Jane Doe');
      expect(normalizedData.contact.email).toBe('jane@example.com');
      expect(normalizedData.summary).toBe('Developer');
      expect(normalizedData.experience).toEqual([]);
      expect(normalizedData.education).toEqual([]);
      expect(normalizedData.skills).toEqual({
        technical: [],
        tools: [],
        languages: [],
        soft: [],
      });
      expect(normalizedData.projects).toEqual([]);

      const validation = CVDataUtils.validateCVData(normalizedData);
      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);

      const completenessScore =
        CVDataUtils.calculateCompletenessScore(normalizedData);
      expect(completenessScore).toBeLessThan(30);

      const sections = templateService.detectAvailableSections(normalizedData);
      expect(sections).toHaveLength(3); // Contact, Summary, Experience (empty but included)
      expect(sections.map((s) => s.title)).toEqual([
        'Contact',
        'Summary',
        'Experience',
      ]);

      const html = templateService.generateDynamicTemplate(
        normalizedData,
        templateService.getDefaultConfig(),
      );
      expect(html).toContain('Jane Doe');
      expect(html).toContain('jane@example.com');
      expect(html).toContain('Developer');
    });

    it('should handle mixed data formats correctly', () => {
      const mixedData = {
        // Some fields in legacy format
        name: 'Bob Smith',
        email: 'bob@example.com',
        phone: '+1111111111',
        // Some fields already in standard format
        contact: {
          linkedin: 'https://linkedin.com/in/bobsmith',
          github: 'https://github.com/bobsmith',
        },
        summary: 'Full-stack developer',
        experience: [
          {
            // Mix of legacy and standard fields
            title: 'Developer',
            company: 'Company',
            duration: '2020 - Present', // Legacy
            startDate: '2020', // Standard
            endDate: '', // Standard
            current: true, // Standard
            responsibilities: ['Code'],
            achievements: ['Success'],
            technologies: ['React'],
          },
        ],
        education: [
          {
            // Legacy format
            degree: 'Computer Science',
            school: 'University',
            year: '2018 - 2020',
          },
        ],
        skills: {
          technical: ['JavaScript'],
          soft: ['Communication'],
          languages: ['English'],
          tools: ['Git'],
        },
        projects: [],
      };

      const normalizedData = CVDataUtils.normalizeCVData(mixedData);

      // Should merge contact information correctly
      expect(normalizedData.contact).toEqual({
        name: 'Bob Smith',
        email: 'bob@example.com',
        phone: '+1111111111',
        address: '',
        linkedin: 'https://linkedin.com/in/bobsmith',
        github: 'https://github.com/bobsmith',
        website: '',
        location: '',
      });

      // Should handle mixed experience format
      expect(normalizedData.experience[0]).toEqual({
        id: 'exp_0',
        title: 'Developer',
        company: 'Company',
        location: '',
        startDate: '2020',
        endDate: '',
        current: true,
        description: '',
        responsibilities: ['Code'],
        achievements: ['Success'],
        technologies: ['React'],
        teamSize: undefined,
        companyDescription: '',
      });

      // Should handle legacy education format
      expect(normalizedData.education[0]).toEqual({
        id: 'edu_0',
        institution: 'University',
        degree: 'Computer Science',
        field: '',
        startDate: '2018',
        endDate: '2020',
        gpa: '',
        description: '',
        location: '',
      });

      const validation = CVDataUtils.validateCVData(normalizedData);
      expect(validation.isValid).toBe(true);

      const sections = templateService.detectAvailableSections(normalizedData);
      expect(sections.length).toBeGreaterThan(3);

      const html = templateService.generateDynamicTemplate(
        normalizedData,
        templateService.getDefaultConfig(),
      );
      expect(html).toContain('Bob Smith');
      expect(html).toContain('bob@example.com');
      expect(html).toContain('Developer');
      expect(html).toContain('Company');
      expect(html).toContain('University');
      expect(html).toContain('Computer Science');
    });
  });

  describe('Template Configuration Integration', () => {
    it('should apply different template configurations correctly', () => {
      const cvData: CVData = {
        contact: {
          name: 'Test User',
          email: 'test@example.com',
        },
        summary: 'Test summary',
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

      const configs = [
        { name: 'default', config: templateService.getDefaultConfig() },
        { name: 'two-column', config: templateService.getTwoColumnConfig() },
        { name: 'modern', config: templateService.getModernConfig() },
        { name: 'show-all', config: templateService.getShowAllConfig() },
      ];

      configs.forEach(({ name, config }) => {
        const html = templateService.generateDynamicTemplate(cvData, config);

        expect(html).toContain('Test User');
        expect(html).toContain('test@example.com');
        expect(html).toContain('Test summary');

        if (name === 'two-column' || name === 'show-all') {
          expect(html).toContain('class="two-column"');
        } else {
          expect(html).toContain('class="single-column"');
        }

        if (name === 'modern') {
          expect(html).toContain('--primary-color: #e74c3c');
        } else if (name === 'two-column') {
          expect(html).toContain('--primary-color: #3498db');
        } else {
          expect(html).toContain('--primary-color: #2c3e50');
        }
      });
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle malformed data gracefully', () => {
      const malformedData = {
        name: null,
        email: undefined,
        experience: 'not an array',
        skills: null,
        projects: { not: 'an array' },
      };

      const normalizedData = CVDataUtils.normalizeCVData(malformedData);

      expect(normalizedData.contact.name).toBe('');
      expect(normalizedData.contact.email).toBe('');
      expect(normalizedData.experience).toEqual([]);
      expect(normalizedData.skills).toEqual({
        technical: [],
        tools: [],
        languages: [],
        soft: [],
      });
      expect(normalizedData.projects).toEqual([]);

      const validation = CVDataUtils.validateCVData(normalizedData);
      expect(validation.isValid).toBe(false);

      const sections = templateService.detectAvailableSections(normalizedData);
      expect(sections.length).toBeGreaterThan(0);

      const html = templateService.generateDynamicTemplate(
        normalizedData,
        templateService.getDefaultConfig(),
      );
      expect(html).toContain('<!DOCTYPE html>');
    });
  });
});
