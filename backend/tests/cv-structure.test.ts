/**
 * CV Structure Test Suite
 * Comprehensive tests for the standardized CV data structure
 */

import { CVDataUtils } from '../src/shared/utils/cv-data.utils';
import { CVData, TemplateConfig } from '../src/shared/interfaces/cv-data.interface';

describe('CV Data Structure Tests', () => {
  // Test data samples
  const sampleLegacyData = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1-555-0123',
    address: '123 Main St, City, State',
    linkedin: 'https://linkedin.com/in/johndoe',
    summary: 'Experienced software engineer with 5+ years in web development',
    experience: [
      {
        title: 'Senior Software Engineer',
        company: 'Tech Corp',
        dates: '2020 - Present',
        description: 'Lead development of web applications',
        technologies: ['React', 'Node.js', 'TypeScript']
      }
    ],
    education: [
      {
        school: 'University of Technology',
        degree: 'Bachelor of Computer Science',
        dates: '2016 - 2020'
      }
    ],
    skills: {
      technical: ['JavaScript', 'Python', 'SQL'],
      soft: ['Leadership', 'Communication'],
      tools: ['Git', 'Docker'],
      languages: ['English (Native)']
    },
    projects: [
      {
        name: 'E-commerce Platform',
        description: 'Built a full-stack e-commerce solution',
        technologies: ['React', 'Node.js', 'MongoDB']
      }
    ]
  };

  const sampleNormalizedData: CVData = {
    id: 'test-cv-001',
    version: '1.0',
    createdAt: '2025-10-16T10:00:00.000Z',
    updatedAt: '2025-10-16T10:00:00.000Z',
    lastModified: '2025-10-16T10:00:00.000Z',
    contact: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1-555-0123',
      address: '123 Main St, City, State',
      linkedin: 'https://linkedin.com/in/johndoe',
      github: '',
      website: '',
      location: ''
    },
    summary: 'Experienced software engineer with 5+ years in web development',
    experience: [
      {
        id: 'exp_0',
        title: 'Senior Software Engineer',
        company: 'Tech Corp',
        location: '',
        startDate: '2020 - Present',
        endDate: '',
        current: false,
        description: 'Lead development of web applications',
        responsibilities: [],
        achievements: [],
        technologies: ['React', 'Node.js', 'TypeScript'],
        teamSize: undefined,
        companyDescription: ''
      }
    ],
    education: [
      {
        id: 'edu_0',
        institution: 'University of Technology',
        degree: 'Bachelor of Computer Science',
        field: '',
        startDate: '2016 - 2020',
        endDate: '',
        gpa: '',
        description: '',
        location: ''
      }
    ],
    skills: {
      technical: ['JavaScript', 'Python', 'SQL'],
      tools: ['Git', 'Docker'],
      languages: ['English (Native)'],
      soft: ['Leadership', 'Communication']
    },
    projects: [
      {
        id: 'project_0',
        name: 'E-commerce Platform',
        description: 'Built a full-stack e-commerce solution',
        startDate: '',
        endDate: '',
        technologies: ['React', 'Node.js', 'MongoDB'],
        role: '',
        teamSize: undefined,
        results: [],
        link: '',
        repository: '',
        duration: ''
      }
    ],
    certifications: [],
    awards: [],
    publications: [],
    volunteer: [],
    languages: []
  };

  describe('Data Normalization', () => {
    test('should normalize legacy CV data correctly', () => {
      const normalized = CVDataUtils.normalizeCVData(sampleLegacyData);
      
      // Check contact information
      expect(normalized.contact.name).toBe('John Doe');
      expect(normalized.contact.email).toBe('john.doe@example.com');
      expect(normalized.contact.phone).toBe('+1-555-0123');
      
      // Check experience normalization
      expect(normalized.experience).toHaveLength(1);
      expect(normalized.experience[0].title).toBe('Senior Software Engineer');
      expect(normalized.experience[0].company).toBe('Tech Corp');
      expect(normalized.experience[0].technologies).toEqual(['React', 'Node.js', 'TypeScript']);
      
      // Check education normalization
      expect(normalized.education).toHaveLength(1);
      expect(normalized.education[0].institution).toBe('University of Technology');
      expect(normalized.education[0].degree).toBe('Bachelor of Computer Science');
      
      // Check skills structure
      expect(normalized.skills.technical).toEqual(['JavaScript', 'Python', 'SQL']);
      expect(normalized.skills.tools).toEqual(['Git', 'Docker']);
      expect(normalized.skills.soft).toEqual(['Leadership', 'Communication']);
      
      // Check metadata
      expect(normalized.version).toBe('1.0');
      expect(normalized.createdAt).toBeDefined();
      expect(normalized.updatedAt).toBeDefined();
    });

    test('should handle empty data gracefully', () => {
      const emptyData = {};
      const normalized = CVDataUtils.normalizeCVData(emptyData);
      
      expect(normalized.contact.name).toBe('');
      expect(normalized.contact.email).toBe('');
      expect(normalized.summary).toBe('');
      expect(normalized.experience).toEqual([]);
      expect(normalized.education).toEqual([]);
      expect(normalized.projects).toEqual([]);
    });

    test('should generate unique IDs for sections', () => {
      const normalized = CVDataUtils.normalizeCVData(sampleLegacyData);
      
      expect(normalized.experience[0].id).toBe('exp_0');
      expect(normalized.education[0].id).toBe('edu_0');
      expect(normalized.projects[0].id).toBe('project_0');
    });
  });

  describe('Data Validation', () => {
    test('should validate correct CV data', () => {
      const validation = CVDataUtils.validateCVData(sampleNormalizedData);
      
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    test('should detect missing required fields', () => {
      const invalidData = { ...sampleNormalizedData };
      invalidData.contact.name = '';
      invalidData.contact.email = '';
      invalidData.summary = '';
      
      const validation = CVDataUtils.validateCVData(invalidData);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Contact name is required');
      expect(validation.errors).toContain('Contact email is required');
      expect(validation.errors).toContain('Summary is required');
    });

    test('should validate array structures', () => {
      const invalidData = { ...sampleNormalizedData };
      invalidData.experience = null as any;
      invalidData.education = 'invalid' as any;
      
      const validation = CVDataUtils.validateCVData(invalidData);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Experience must be an array');
      expect(validation.errors).toContain('Education must be an array');
    });

    test('should validate skills structure', () => {
      const invalidData = { ...sampleNormalizedData };
      invalidData.skills = null as any;
      
      const validation = CVDataUtils.validateCVData(invalidData);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Skills object is required');
    });
  });

  describe('CV Statistics', () => {
    test('should calculate correct CV statistics', () => {
      const stats = CVDataUtils.getCVStats(sampleNormalizedData);
      
      expect(stats.experienceCount).toBe(1);
      expect(stats.educationCount).toBe(1);
      expect(stats.projectCount).toBe(1);
      expect(stats.skillCount).toBe(7); // 3 technical + 2 tools + 2 soft + 1 language
      expect(stats.completenessScore).toBeGreaterThan(0);
      expect(stats.totalSections).toBeGreaterThan(0);
    });

    test('should handle empty CV statistics', () => {
      const emptyData = CVDataUtils.normalizeCVData({});
      const stats = CVDataUtils.getCVStats(emptyData);
      
      expect(stats.experienceCount).toBe(0);
      expect(stats.educationCount).toBe(0);
      expect(stats.projectCount).toBe(0);
      expect(stats.skillCount).toBe(0);
      expect(stats.completenessScore).toBe(0);
    });
  });

  describe('Template Configuration', () => {
    test('should return default template configuration', () => {
      const config = CVDataUtils.getDefaultTemplateConfig();
      
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

    test('should support different layout types', () => {
      const singleColumnConfig = CVDataUtils.getDefaultTemplateConfig();
      singleColumnConfig.layout = 'single-column';
      
      const twoColumnConfig = CVDataUtils.getDefaultTemplateConfig();
      twoColumnConfig.layout = 'two-column';
      
      const modernConfig = CVDataUtils.getDefaultTemplateConfig();
      modernConfig.layout = 'modern';
      
      expect(singleColumnConfig.layout).toBe('single-column');
      expect(twoColumnConfig.layout).toBe('two-column');
      expect(modernConfig.layout).toBe('modern');
    });
  });

  describe('Data Merging', () => {
    test('should merge CV data correctly', () => {
      const originalData = sampleNormalizedData;
      const updates = {
        summary: 'Updated summary with more details',
        contact: {
          ...originalData.contact,
          github: 'https://github.com/johndoe'
        }
      };
      
      const mergedData = CVDataUtils.mergeCVData(originalData, updates);
      
      expect(mergedData.summary).toBe('Updated summary with more details');
      expect(mergedData.contact.github).toBe('https://github.com/johndoe');
      expect(mergedData.contact.name).toBe('John Doe'); // Should preserve original
      expect(mergedData.updatedAt).not.toBe(originalData.updatedAt);
      expect(mergedData.lastModified).not.toBe(originalData.lastModified);
    });

    test('should preserve original data when no updates provided', () => {
      const originalData = sampleNormalizedData;
      const updates = {};
      
      const mergedData = CVDataUtils.mergeCVData(originalData, updates);
      
      expect(mergedData.summary).toBe(originalData.summary);
      expect(mergedData.contact.name).toBe(originalData.contact.name);
      expect(mergedData.experience).toEqual(originalData.experience);
    });
  });

  describe('Legacy Data Conversion', () => {
    test('should convert legacy data structure', () => {
      const legacyData = {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        phone: '+1-555-0456',
        summary: 'Product manager with 3 years experience',
        experience: [
          {
            title: 'Product Manager',
            company: 'Startup Inc',
            dates: '2022 - Present',
            description: 'Manage product roadmap and strategy'
          }
        ],
        education: [
          {
            school: 'Business School',
            degree: 'MBA',
            dates: '2020 - 2022'
          }
        ],
        skills: {
          technical: ['Product Management', 'Analytics'],
          soft: ['Leadership', 'Communication']
        }
      };
      
      const convertedData = CVDataUtils.convertLegacyData(legacyData);
      
      expect(convertedData.contact.name).toBe('Jane Smith');
      expect(convertedData.contact.email).toBe('jane.smith@example.com');
      expect(convertedData.contact.phone).toBe('+1-555-0456');
      expect(convertedData.summary).toBe('Product manager with 3 years experience');
      expect(convertedData.experience).toHaveLength(1);
      expect(convertedData.education).toHaveLength(1);
      expect(convertedData.skills.technical).toEqual(['Product Management', 'Analytics']);
    });
  });

  describe('Edge Cases', () => {
    test('should handle null and undefined values', () => {
      const dataWithNulls = {
        name: 'Test User',
        email: 'test@example.com',
        phone: null,
        address: undefined,
        summary: '',
        experience: null,
        education: undefined,
        skills: null,
        projects: []
      };
      
      const normalized = CVDataUtils.normalizeCVData(dataWithNulls);
      
      expect(normalized.contact.phone).toBe('');
      expect(normalized.contact.address).toBe('');
      expect(normalized.experience).toEqual([]);
      expect(normalized.education).toEqual([]);
      expect(normalized.skills.technical).toEqual([]);
    });

    test('should handle malformed array data', () => {
      const malformedData = {
        name: 'Test User',
        email: 'test@example.com',
        summary: 'Test summary',
        experience: 'not an array',
        education: 123,
        skills: 'invalid',
        projects: null
      };
      
      const normalized = CVDataUtils.normalizeCVData(malformedData);
      
      expect(Array.isArray(normalized.experience)).toBe(true);
      expect(Array.isArray(normalized.education)).toBe(true);
      expect(normalized.skills).toBeDefined();
      expect(Array.isArray(normalized.projects)).toBe(true);
    });

    test('should handle very large datasets', () => {
      const largeData = {
        name: 'Test User',
        email: 'test@example.com',
        summary: 'Test summary',
        experience: Array.from({ length: 100 }, (_, i) => ({
          title: `Job ${i}`,
          company: `Company ${i}`,
          dates: '2020 - Present',
          description: `Description ${i}`
        })),
        education: Array.from({ length: 50 }, (_, i) => ({
          school: `School ${i}`,
          degree: `Degree ${i}`,
          dates: '2016 - 2020'
        })),
        projects: Array.from({ length: 200 }, (_, i) => ({
          name: `Project ${i}`,
          description: `Description ${i}`,
          technologies: [`Tech${i}`]
        }))
      };
      
      const startTime = Date.now();
      const normalized = CVDataUtils.normalizeCVData(largeData);
      const endTime = Date.now();
      
      expect(normalized.experience).toHaveLength(100);
      expect(normalized.education).toHaveLength(50);
      expect(normalized.projects).toHaveLength(200);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });
  });
});
