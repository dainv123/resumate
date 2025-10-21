import { migrateCVData } from './migrate-cv-data-to-standard';
import { createConnection, getRepository } from 'typeorm';
import { Cv } from '../modules/cv/entities/cv.entity';

// Mock TypeORM
jest.mock('typeorm', () => ({
  createConnection: jest.fn(),
  getRepository: jest.fn(),
}));

// Mock console methods
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

describe('CV Data Migration Script', () => {
  let mockConnection: any;
  let mockRepository: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockRepository = {
      find: jest.fn(),
      update: jest.fn(),
    };

    mockConnection = {
      getRepository: jest.fn().mockReturnValue(mockRepository),
      close: jest.fn(),
    };

    (createConnection as jest.Mock).mockResolvedValue(mockConnection);
    (getRepository as jest.Mock).mockReturnValue(mockRepository);
  });

  afterEach(() => {
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
  });

  describe('migrateCVData', () => {
    it('should migrate legacy CV data to standard structure', async () => {
      const legacyCVs = [
        {
          id: 'cv-1',
          parsedData: {
            name: 'John Doe',
            email: 'john@example.com',
            phone: '+1234567890',
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

      mockRepository.find.mockResolvedValue(legacyCVs);
      mockRepository.update.mockResolvedValue({ affected: 1 });

      await migrateCVData();

      expect(mockRepository.find).toHaveBeenCalledTimes(1);
      expect(mockRepository.update).toHaveBeenCalledTimes(2);
      expect(mockConnection.close).toHaveBeenCalledTimes(1);

      // Check that first CV was migrated with proper structure
      const firstUpdateCall = mockRepository.update.mock.calls[0];
      expect(firstUpdateCall[0]).toBe('cv-1');
      
      const migratedData = firstUpdateCall[1].parsedData;
      expect(migratedData.contact).toEqual({
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        address: '',
        linkedin: '',
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

      mockRepository.find.mockResolvedValue(standardCVs);

      await migrateCVData();

      expect(mockRepository.find).toHaveBeenCalledTimes(1);
      expect(mockRepository.update).not.toHaveBeenCalled();
      expect(mockConnection.close).toHaveBeenCalledTimes(1);
    });

    it('should handle empty CV list', async () => {
      mockRepository.find.mockResolvedValue([]);

      await migrateCVData();

      expect(mockRepository.find).toHaveBeenCalledTimes(1);
      expect(mockRepository.update).not.toHaveBeenCalled();
      expect(mockConnection.close).toHaveBeenCalledTimes(1);
    });

    it('should handle CVs with null parsedData', async () => {
      const cvsWithNullData = [
        {
          id: 'cv-1',
          parsedData: null
        },
        {
          id: 'cv-2',
          parsedData: undefined
        }
      ];

      mockRepository.find.mockResolvedValue(cvsWithNullData);

      await migrateCVData();

      expect(mockRepository.find).toHaveBeenCalledTimes(1);
      expect(mockRepository.update).not.toHaveBeenCalled();
      expect(mockConnection.close).toHaveBeenCalledTimes(1);
    });

    it('should handle migration errors gracefully', async () => {
      const legacyCVs = [
        {
          id: 'cv-1',
          parsedData: {
            name: 'John Doe',
            email: 'john@example.com'
          }
        },
        {
          id: 'cv-2',
          parsedData: {
            name: 'Jane Doe',
            email: 'jane@example.com'
          }
        }
      ];

      mockRepository.find.mockResolvedValue(legacyCVs);
      mockRepository.update
        .mockResolvedValueOnce({ affected: 1 }) // First CV succeeds
        .mockRejectedValueOnce(new Error('Database error')); // Second CV fails

      await migrateCVData();

      expect(mockRepository.find).toHaveBeenCalledTimes(1);
      expect(mockRepository.update).toHaveBeenCalledTimes(2);
      expect(mockConnection.close).toHaveBeenCalledTimes(1);

      // Should log error for failed CV
      expect(mockConsoleError).toHaveBeenCalledWith(
        '❌ Error migrating CV cv-2:',
        'Database error'
      );
    });

    it('should handle database connection errors', async () => {
      (createConnection as jest.Mock).mockRejectedValue(new Error('Connection failed'));

      await expect(migrateCVData()).rejects.toThrow('Connection failed');
    });

    it('should use environment variables for database connection', async () => {
      const originalEnv = process.env;
      process.env = {
        ...originalEnv,
        DB_HOST: 'test-host',
        DB_PORT: '5433',
        DB_USERNAME: 'test-user',
        DB_PASSWORD: 'test-password',
        DB_DATABASE: 'test-db'
      };

      mockRepository.find.mockResolvedValue([]);

      await migrateCVData();

      expect(createConnection).toHaveBeenCalledWith({
        type: 'postgres',
        host: 'test-host',
        port: 5433,
        username: 'test-user',
        password: 'test-password',
        database: 'test-db',
        entities: [Cv],
        synchronize: false,
        logging: false
      });

      process.env = originalEnv;
    });

    it('should use default values when environment variables are not set', async () => {
      const originalEnv = process.env;
      process.env = {};

      mockRepository.find.mockResolvedValue([]);

      await migrateCVData();

      expect(createConnection).toHaveBeenCalledWith({
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        username: 'postgres',
        password: 'password',
        database: 'resumate',
        entities: [Cv],
        synchronize: false,
        logging: false
      });

      process.env = originalEnv;
    });

    it('should log migration statistics', async () => {
      const legacyCVs = [
        {
          id: 'cv-1',
          parsedData: {
            name: 'John Doe',
            email: 'john@example.com'
          }
        },
        {
          id: 'cv-2',
          parsedData: {
            contact: {
              name: 'Jane Doe',
              email: 'jane@example.com'
            }
          }
        },
        {
          id: 'cv-3',
          parsedData: {
            name: 'Bob Smith',
            email: 'bob@example.com'
          }
        }
      ];

      mockRepository.find.mockResolvedValue(legacyCVs);
      mockRepository.update
        .mockResolvedValueOnce({ affected: 1 }) // cv-1 succeeds
        .mockResolvedValueOnce({ affected: 1 }) // cv-3 succeeds
        // cv-2 is skipped (already in standard format)

      await migrateCVData();

      expect(mockConsoleLog).toHaveBeenCalledWith('🔄 Starting CV data migration to standard structure...');
      expect(mockConsoleLog).toHaveBeenCalledWith('✅ Database connected');
      expect(mockConsoleLog).toHaveBeenCalledWith('📊 Found 3 CVs to migrate');
      expect(mockConsoleLog).toHaveBeenCalledWith('⏭️  CV cv-2 already in standard format, skipping');
      expect(mockConsoleLog).toHaveBeenCalledWith('✅ Migrated CV cv-1');
      expect(mockConsoleLog).toHaveBeenCalledWith('✅ Migrated CV cv-3');
      expect(mockConsoleLog).toHaveBeenCalledWith('\n🎉 Migration completed!');
      expect(mockConsoleLog).toHaveBeenCalledWith('✅ Migrated: 2 CVs');
      expect(mockConsoleLog).toHaveBeenCalledWith('⏭️  Skipped: 1 CVs');
      expect(mockConsoleLog).toHaveBeenCalledWith('❌ Errors: 0 CVs');
      expect(mockConsoleLog).toHaveBeenCalledWith('📊 Total: 3 CVs');
      expect(mockConsoleLog).toHaveBeenCalledWith('🔌 Database connection closed');
    });
  });
});
