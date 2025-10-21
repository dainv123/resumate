import { CVDataUtils } from './cv-data.utils';
import { CVData, ContactInfo, Experience, Education, Project, Skills, TemplateConfig } from '../interfaces/cv-data.interface';

describe('CVDataUtils', () => {
  describe('normalizeCVData', () => {
    it('should normalize legacy CV data to standard structure', () => {
      const legacyData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        address: '123 Main St',
        linkedin: 'https://linkedin.com/in/johndoe',
        summary: 'Experienced developer',
        experience: [
          {
            title: 'Senior Developer',
            company: 'Tech Corp',
            duration: '2020 - Present',
            teamSize: '5',
            responsibilities: ['Lead development', 'Mentor team'],
            achievements: ['Improved performance by 50%'],
            technologies: ['React', 'Node.js']
          }
        ],
        education: [
          {
            degree: 'Computer Science',
            school: 'University',
            year: '2018 - 2020',
            gpa: '3.8'
          }
        ],
        skills: {
          technical: ['JavaScript', 'Python'],
          soft: ['Leadership', 'Communication'],
          languages: ['English', 'Spanish'],
          tools: ['Git', 'Docker']
        },
        projects: [
          {
            name: 'E-commerce App',
            description: 'Full-stack e-commerce application',
            techStack: ['React', 'Node.js', 'MongoDB'],
            duration: '6 months'
          }
        ]
      };

      const result = CVDataUtils.normalizeCVData(legacyData);

      expect(result.contact).toEqual({
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        address: '123 Main St',
        linkedin: 'https://linkedin.com/in/johndoe',
        github: '',
        website: '',
        location: ''
      });

      expect(result.summary).toBe('Experienced developer');
      expect(result.experience).toHaveLength(1);
      expect(result.education).toHaveLength(1);
      expect(result.skills).toEqual(legacyData.skills);
      expect(result.projects).toHaveLength(1);
    });

    it('should handle empty or null data gracefully', () => {
      const emptyData = {};
      const result = CVDataUtils.normalizeCVData(emptyData);

      expect(result.contact).toEqual({
        name: '',
        email: '',
        phone: '',
        address: '',
        linkedin: '',
        github: '',
        website: '',
        location: ''
      });

      expect(result.summary).toBe('');
      expect(result.experience).toEqual([]);
      expect(result.education).toEqual([]);
      expect(result.skills).toEqual({
        technical: [],
        tools: [],
        languages: [],
        soft: []
      });
      expect(result.projects).toEqual([]);
    });

    it('should preserve existing standard structure', () => {
      const standardData: CVData = {
        contact: {
          name: 'Jane Doe',
          email: 'jane@example.com',
          phone: '+0987654321',
          address: '456 Oak Ave',
          linkedin: 'https://linkedin.com/in/janedoe',
          github: 'https://github.com/janedoe',
          website: 'https://janedoe.com',
          location: 'San Francisco, CA'
        },
        summary: 'Full-stack developer with 5 years experience',
        experience: [
          {
            id: 'exp_1',
            title: 'Lead Developer',
            company: 'Startup Inc',
            location: 'Remote',
            startDate: '2021',
            endDate: '',
            current: true,
            description: 'Leading a team of 8 developers',
            responsibilities: ['Architecture design', 'Code review'],
            achievements: ['Reduced bugs by 70%'],
            technologies: ['TypeScript', 'React', 'AWS'],
            teamSize: 8,
            companyDescription: 'Fast-growing startup'
          }
        ],
        education: [
          {
            id: 'edu_1',
            institution: 'MIT',
            degree: 'Master of Science',
            field: 'Computer Science',
            startDate: '2019',
            endDate: '2021',
            gpa: '3.9',
            description: 'Focus on AI and Machine Learning',
            location: 'Cambridge, MA'
          }
        ],
        skills: {
          technical: ['TypeScript', 'React', 'Node.js', 'Python'],
          tools: ['Git', 'Docker', 'AWS', 'Kubernetes'],
          languages: ['English', 'French'],
          soft: ['Leadership', 'Problem Solving', 'Communication']
        },
        projects: [
          {
            id: 'proj_1',
            name: 'AI Chatbot',
            description: 'Intelligent customer service chatbot',
            startDate: '2023',
            endDate: '2023',
            technologies: ['Python', 'TensorFlow', 'React'],
            role: 'Lead Developer',
            teamSize: 3,
            results: ['95% customer satisfaction', '50% reduction in support tickets'],
            link: 'https://chatbot.example.com',
            repository: 'https://github.com/company/chatbot',
            duration: '3 months'
          }
        ],
        template: {
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
            languages: true
          },
          styling: {
            primaryColor: '#2563eb',
            secondaryColor: '#1e40af',
            fontFamily: 'Inter, sans-serif',
            fontSize: 'medium'
          }
        }
      };

      const result = CVDataUtils.normalizeCVData(standardData);

      expect(result).toEqual(standardData);
    });
  });

  describe('normalizeContactInfo', () => {
    it('should normalize contact information', () => {
      const contact = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890'
      };

      const result = CVDataUtils.normalizeContactInfo(contact);

      expect(result).toEqual({
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        address: '',
        linkedin: '',
        github: '',
        website: '',
        location: ''
      });
    });

    it('should handle missing fields', () => {
      const contact = {};
      const result = CVDataUtils.normalizeContactInfo(contact);

      expect(result).toEqual({
        name: '',
        email: '',
        phone: '',
        address: '',
        linkedin: '',
        github: '',
        website: '',
        location: ''
      });
    });
  });

  describe('normalizeExperience', () => {
    it('should normalize experience array', () => {
      const experience = [
        {
          title: 'Developer',
          company: 'Tech Corp',
          duration: '2020 - Present',
          teamSize: '5',
          responsibilities: ['Code', 'Review'],
          achievements: ['Success'],
          technologies: ['React']
        }
      ];

      const result = CVDataUtils.normalizeExperience(experience);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 'exp_0',
        title: 'Developer',
        company: 'Tech Corp',
        location: '',
        startDate: '2020',
        endDate: '',
        current: true,
        description: '',
        responsibilities: ['Code', 'Review'],
        achievements: ['Success'],
        technologies: ['React'],
        teamSize: 5,
        companyDescription: ''
      });
    });

    it('should handle empty experience array', () => {
      const result = CVDataUtils.normalizeExperience([]);
      expect(result).toEqual([]);
    });

    it('should parse duration correctly', () => {
      const experience = [
        {
          title: 'Developer',
          company: 'Tech Corp',
          duration: '2018 - 2020',
          current: false
        }
      ];

      const result = CVDataUtils.normalizeExperience(experience);

      expect(result[0].startDate).toBe('2018');
      expect(result[0].endDate).toBe('2020');
      expect(result[0].current).toBe(false);
    });
  });

  describe('normalizeEducation', () => {
    it('should normalize education array', () => {
      const education = [
        {
          degree: 'Computer Science',
          school: 'University',
          year: '2018 - 2020',
          gpa: '3.8'
        }
      ];

      const result = CVDataUtils.normalizeEducation(education);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 'edu_0',
        institution: 'University',
        degree: 'Computer Science',
        field: '',
        startDate: '2018',
        endDate: '2020',
        gpa: '3.8',
        description: '',
        location: ''
      });
    });

    it('should handle both school and institution fields', () => {
      const education = [
        {
          institution: 'MIT',
          degree: 'MS',
          year: '2019 - 2021'
        }
      ];

      const result = CVDataUtils.normalizeEducation(education);

      expect(result[0].institution).toBe('MIT');
    });
  });

  describe('normalizeSkills', () => {
    it('should normalize skills object', () => {
      const skills = {
        technical: ['JavaScript', 'Python'],
        soft: ['Leadership'],
        languages: ['English'],
        tools: ['Git']
      };

      const result = CVDataUtils.normalizeSkills(skills);

      expect(result).toEqual({
        technical: ['JavaScript', 'Python'],
        tools: ['Git'],
        languages: ['English'],
        soft: ['Leadership']
      });
    });

    it('should handle missing skill categories', () => {
      const skills = {
        technical: ['JavaScript']
      };

      const result = CVDataUtils.normalizeSkills(skills);

      expect(result).toEqual({
        technical: ['JavaScript'],
        tools: [],
        languages: [],
        soft: []
      });
    });
  });

  describe('normalizeProjects', () => {
    it('should normalize projects array', () => {
      const projects = [
        {
          name: 'E-commerce App',
          description: 'Full-stack application',
          techStack: ['React', 'Node.js'],
          duration: '6 months'
        }
      ];

      const result = CVDataUtils.normalizeProjects(projects);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 'proj_0',
        name: 'E-commerce App',
        description: 'Full-stack application',
        startDate: '6 months',
        endDate: '',
        technologies: ['React', 'Node.js'],
        role: '',
        teamSize: undefined,
        results: [],
        link: '',
        repository: '',
        duration: '6 months'
      });
    });
  });

  describe('getDefaultTemplateConfig', () => {
    it('should return default template configuration', () => {
      const result = CVDataUtils.getDefaultTemplateConfig();

      expect(result).toEqual({
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
          languages: true
        },
        styling: {
          primaryColor: '#2c3e50',
          secondaryColor: '#34495e',
          fontFamily: 'Arial, sans-serif',
          fontSize: 'medium'
        }
      });
    });
  });

  describe('validateCVData', () => {
    it('should validate complete CV data', () => {
      const validData: CVData = {
        contact: {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890'
        },
        summary: 'Experienced developer',
        experience: [],
        education: [],
        skills: {
          technical: [],
          tools: [],
          languages: [],
          soft: []
        },
        projects: []
      };

      const result = CVDataUtils.validateCVData(validData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing required fields', () => {
      const invalidData = {
        contact: {
          name: '',
          email: '',
          phone: ''
        },
        summary: '',
        experience: [],
        education: [],
        skills: {
          technical: [],
          tools: [],
          languages: [],
          soft: []
        },
        projects: []
      };

      const result = CVDataUtils.validateCVData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('calculateCompletenessScore', () => {
    it('should calculate completeness score for complete CV', () => {
      const completeData: CVData = {
        contact: {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890',
          linkedin: 'https://linkedin.com/in/johndoe'
        },
        summary: 'Experienced developer with 5 years of experience',
        experience: [
          {
            title: 'Senior Developer',
            company: 'Tech Corp',
            startDate: '2020',
            endDate: '',
            current: true,
            responsibilities: ['Lead development'],
            achievements: ['Improved performance'],
            technologies: ['React', 'Node.js']
          }
        ],
        education: [
          {
            institution: 'University',
            degree: 'Computer Science',
            startDate: '2018',
            endDate: '2020'
          }
        ],
        skills: {
          technical: ['JavaScript', 'Python'],
          tools: ['Git', 'Docker'],
          languages: ['English'],
          soft: ['Leadership']
        },
        projects: [
          {
            name: 'E-commerce App',
            description: 'Full-stack application',
            startDate: '2023',
            endDate: '2023',
            technologies: ['React', 'Node.js']
          }
        ]
      };

      const score = CVDataUtils.calculateCompletenessScore(completeData);

      expect(score).toBeGreaterThan(80);
    });

    it('should calculate low score for incomplete CV', () => {
      const incompleteData: CVData = {
        contact: {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '',
          address: '',
          linkedin: '',
          github: '',
          website: '',
          location: ''
        },
        summary: '',
        experience: [],
        education: [],
        skills: {
          technical: [],
          tools: [],
          languages: [],
          soft: []
        },
        projects: []
      };

      const score = CVDataUtils.calculateCompletenessScore(incompleteData);

      expect(score).toBeLessThan(30);
    });
  });
});
