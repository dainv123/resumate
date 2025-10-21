import { MigrateCVDataToStandard1704000000000 } from './1704000000000-MigrateCVDataToStandard';
import { QueryRunner } from 'typeorm';

describe('MigrateCVDataToStandard1704000000000', () => {
  let migration: MigrateCVDataToStandard1704000000000;
  let mockQueryRunner: jest.Mocked<QueryRunner>;

  beforeEach(() => {
    migration = new MigrateCVDataToStandard1704000000000();
    mockQueryRunner = {
      query: jest.fn(),
    } as any;
  });

  describe('up', () => {
    it('should migrate legacy CV data to standard structure', async () => {
      const legacyCVs = [
        {
          id: 'cv-1',
          parsedData: {
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
                responsibilities: ['Lead development'],
                achievements: ['Improved performance'],
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
              soft: ['Leadership'],
              languages: ['English'],
              tools: ['Git']
            },
            projects: [
              {
                name: 'E-commerce App',
                description: 'Full-stack application',
                techStack: ['React', 'Node.js'],
                duration: '6 months'
              }
            ]
          }
        },
        {
          id: 'cv-2',
          parsedData: {
            name: 'Jane Doe',
            email: 'jane@example.com',
            phone: '+0987654321',
            summary: 'Full-stack developer',
            experience: [],
            education: [],
            skills: {
              technical: [],
              soft: [],
              languages: [],
              tools: []
            },
            projects: []
          }
        }
      ];

      mockQueryRunner.query
        .mockResolvedValueOnce(legacyCVs) // First query to get CVs
        .mockResolvedValueOnce({ affected: 1 }) // Update cv-1
        .mockResolvedValueOnce({ affected: 1 }); // Update cv-2

      await migration.up(mockQueryRunner);

      expect(mockQueryRunner.query).toHaveBeenCalledTimes(3);
      expect(mockQueryRunner.query).toHaveBeenNthCalledWith(1, `
            SELECT id, "parsedData" FROM cvs 
            WHERE "parsedData" IS NOT NULL
        `);

      // Check that first CV was migrated with proper structure
      const firstUpdateCall = mockQueryRunner.query.mock.calls[1];
      expect(firstUpdateCall[0]).toBe(`
                UPDATE cvs 
                SET "parsedData" = $1 
                WHERE id = $2
            `);
      expect(firstUpdateCall[1]).toHaveLength(2);
      expect(firstUpdateCall[1][1]).toBe('cv-1');

      const migratedData = JSON.parse(firstUpdateCall[1][0]);
      expect(migratedData.contact).toEqual({
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        address: '123 Main St',
        linkedin: 'https://linkedin.com/in/johndoe',
        github: '',
        website: '',
        location: ''
      });

      expect(migratedData.experience[0]).toEqual({
        id: 'exp_0',
        title: 'Senior Developer',
        company: 'Tech Corp',
        location: '',
        startDate: '2020',
        endDate: '',
        current: true,
        description: '',
        responsibilities: ['Lead development'],
        achievements: ['Improved performance'],
        technologies: ['React', 'Node.js'],
        teamSize: 5,
        companyDescription: ''
      });

      expect(migratedData.education[0]).toEqual({
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

      expect(migratedData.skills).toEqual({
        technical: ['JavaScript', 'Python'],
        tools: ['Git'],
        languages: ['English'],
        soft: ['Leadership']
      });

      expect(migratedData.projects[0]).toEqual({
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

      expect(migratedData.template).toBeDefined();
      expect(migratedData.template.layout).toBe('single-column');
    });

    it('should skip CVs already in standard format', async () => {
      const standardCVs = [
        {
          id: 'cv-1',
          parsedData: {
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
          }
        }
      ];

      mockQueryRunner.query.mockResolvedValueOnce(standardCVs);

      await migration.up(mockQueryRunner);

      expect(mockQueryRunner.query).toHaveBeenCalledTimes(1);
    });

    it('should handle empty CV list', async () => {
      mockQueryRunner.query.mockResolvedValueOnce([]);

      await migration.up(mockQueryRunner);

      expect(mockQueryRunner.query).toHaveBeenCalledTimes(1);
    });

    it('should handle CVs with null parsedData', async () => {
      const cvsWithNullData = [
        {
          id: 'cv-1',
          parsedData: null
        }
      ];

      mockQueryRunner.query.mockResolvedValueOnce(cvsWithNullData);

      await migration.up(mockQueryRunner);

      expect(mockQueryRunner.query).toHaveBeenCalledTimes(1);
    });

    it('should handle migration errors gracefully', async () => {
      const legacyCVs = [
        {
          id: 'cv-1',
          parsedData: {
            name: 'John Doe',
            email: 'john@example.com'
          }
        }
      ];

      mockQueryRunner.query
        .mockResolvedValueOnce(legacyCVs)
        .mockRejectedValueOnce(new Error('Database error'));

      // Should not throw error
      await expect(migration.up(mockQueryRunner)).resolves.not.toThrow();
    });
  });

  describe('down', () => {
    it('should revert standard CV data to legacy structure', async () => {
      const standardCVs = [
        {
          id: 'cv-1',
          parsedData: {
            contact: {
              name: 'John Doe',
              email: 'john@example.com',
              phone: '+1234567890'
            },
            summary: 'Experienced developer',
            experience: [
              {
                id: 'exp_0',
                title: 'Senior Developer',
                company: 'Tech Corp',
                startDate: '2020',
                endDate: '',
                current: true,
                responsibilities: ['Lead development'],
                achievements: ['Improved performance'],
                technologies: ['React', 'Node.js'],
                teamSize: 5
              }
            ],
            education: [
              {
                id: 'edu_0',
                institution: 'University',
                degree: 'Computer Science',
                startDate: '2018',
                endDate: '2020',
                gpa: '3.8'
              }
            ],
            skills: {
              technical: ['JavaScript', 'Python'],
              tools: ['Git'],
              languages: ['English'],
              soft: ['Leadership']
            },
            projects: [
              {
                id: 'proj_0',
                name: 'E-commerce App',
                description: 'Full-stack application',
                startDate: '2023',
                endDate: '2023',
                technologies: ['React', 'Node.js']
              }
            ]
          }
        }
      ];

      mockQueryRunner.query
        .mockResolvedValueOnce(standardCVs)
        .mockResolvedValueOnce({ affected: 1 });

      await migration.down(mockQueryRunner);

      expect(mockQueryRunner.query).toHaveBeenCalledTimes(2);
      expect(mockQueryRunner.query).toHaveBeenNthCalledWith(1, `
            SELECT id, "parsedData" FROM cvs 
            WHERE "parsedData" IS NOT NULL 
            AND "parsedData"->>'contact' IS NOT NULL
        `);

      // Check that CV was reverted to legacy structure
      const updateCall = mockQueryRunner.query.mock.calls[1];
      expect(updateCall[0]).toBe(`
                UPDATE cvs 
                SET "parsedData" = $1 
                WHERE id = $2
            `);
      expect(updateCall[1]).toHaveLength(2);
      expect(updateCall[1][1]).toBe('cv-1');

      const legacyData = JSON.parse(updateCall[1][0]);
      expect(legacyData.name).toBe('John Doe');
      expect(legacyData.email).toBe('john@example.com');
      expect(legacyData.phone).toBe('+1234567890');
      expect(legacyData.summary).toBe('Experienced developer');

      expect(legacyData.experience[0]).toEqual({
        title: 'Senior Developer',
        company: 'Tech Corp',
        duration: '2020 - Present',
        teamSize: '5',
        responsibilities: ['Lead development'],
        achievements: ['Improved performance'],
        technologies: ['React', 'Node.js']
      });

      expect(legacyData.education[0]).toEqual({
        degree: 'Computer Science',
        school: 'University',
        year: '2018 - 2020',
        gpa: '3.8'
      });

      expect(legacyData.skills).toEqual({
        technical: ['JavaScript', 'Python'],
        soft: ['Leadership'],
        languages: ['English'],
        tools: ['Git']
      });

      expect(legacyData.projects[0]).toEqual({
        name: 'E-commerce App',
        description: 'Full-stack application',
        techStack: ['React', 'Node.js'],
        duration: '2023 - 2023'
      });
    });

    it('should handle empty CV list', async () => {
      mockQueryRunner.query.mockResolvedValueOnce([]);

      await migration.down(mockQueryRunner);

      expect(mockQueryRunner.query).toHaveBeenCalledTimes(1);
    });
  });

  describe('helper methods', () => {
    it('should extract start date from duration', () => {
      const migration = new MigrateCVDataToStandard1704000000000();
      const startDate = (migration as any).extractStartDate('2020 - Present');
      expect(startDate).toBe('2020');
    });

    it('should extract end date from duration', () => {
      const migration = new MigrateCVDataToStandard1704000000000();
      const endDate = (migration as any).extractEndDate('2020 - Present');
      expect(endDate).toBe('');
    });

    it('should detect current status', () => {
      const migration = new MigrateCVDataToStandard1704000000000();
      expect((migration as any).isCurrent('2020 - Present')).toBe(true);
      expect((migration as any).isCurrent('2020 - Current')).toBe(true);
      expect((migration as any).isCurrent('2020 - Now')).toBe(true);
      expect((migration as any).isCurrent('2020 - 2023')).toBe(false);
    });

    it('should format duration correctly', () => {
      const migration = new MigrateCVDataToStandard1704000000000();
      expect((migration as any).formatDuration('2020', '', true)).toBe('2020 - Present');
      expect((migration as any).formatDuration('2020', '2023', false)).toBe('2020 - 2023');
    });

    it('should return default template config', () => {
      const migration = new MigrateCVDataToStandard1704000000000();
      const config = (migration as any).getDefaultTemplateConfig();
      
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
});
