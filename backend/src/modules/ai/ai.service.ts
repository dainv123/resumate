import { Injectable, Logger } from '@nestjs/common';
import { GoogleAIService } from './providers/google-ai.service';
import { DocumentParserService } from './providers/document-parser.service';
import { CVData } from '../cv/entities/cv.entity';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private googleAIService: GoogleAIService,
    private documentParserService: DocumentParserService,
  ) {}

  async parseCvWithRetry(fileBuffer: Buffer, mimeType: string, maxRetries = 3): Promise<CVData> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Extract text from file
        const text = await this.documentParserService.extractTextFromFile(fileBuffer, mimeType);
        
        // Parse with AI
        const cvData = await this.googleAIService.parseCvContent(text);
        
        this.logger.log(`CV parsed successfully on attempt ${attempt}`);
        return cvData;
      } catch (error) {
        this.logger.warn(`CV parsing attempt ${attempt} failed:`, error.message);
        
        if (attempt === maxRetries) {
          this.logger.error('All CV parsing attempts failed, using fallback');
          return this.fallbackParsing(fileBuffer, mimeType);
        }
        
        // Exponential backoff
        await this.delay(1000 * attempt);
      }
    }
    
    // This should never be reached, but TypeScript requires it
    return this.fallbackParsing(fileBuffer, mimeType);
  }

  async generateProjectBullets(project: {
    name: string;
    role: string;
    techStack: string[];
    results?: string;
  }): Promise<string[]> {
    try {
      return await this.googleAIService.generateBulletPoints(
        project.name,
        project.role,
        project.techStack
      );
    } catch (error) {
      this.logger.error('Error generating project bullets:', error);
      return this.fallbackProjectBullets(project);
    }
  }

  async tailorCvForJob(cvData: CVData, jobDescription: string): Promise<CVData> {
    try {
      return await this.googleAIService.tailorCvContent(cvData, jobDescription);
    } catch (error) {
      this.logger.error('Error tailoring CV:', error);
      return cvData; // Return original if tailoring fails
    }
  }

  async suggestImprovements(cvData: CVData): Promise<string[]> {
    try {
      return await this.googleAIService.generateSuggestions(cvData);
    } catch (error) {
      this.logger.error('Error generating suggestions:', error);
      return this.fallbackSuggestions();
    }
  }

  async extractJobKeywords(jobDescription: string): Promise<{
    skills: string[];
    requirements: string[];
    keywords: string[];
  }> {
    try {
      const keywords = await this.googleAIService.extractKeywords(jobDescription);
      return {
        skills: keywords,
        requirements: keywords,
        keywords: keywords,
      };
    } catch (error) {
      this.logger.error('Error extracting job keywords:', error);
      return this.fallbackJobKeywords(jobDescription);
    }
  }

  private async fallbackParsing(fileBuffer: Buffer, mimeType: string): Promise<CVData> {
    try {
      // Try to extract text without AI
      const text = await this.documentParserService.extractTextFromFile(fileBuffer, mimeType);
      
      // Basic regex-based parsing
      const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
      const phoneMatch = text.match(/(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/);
      
      return {
        name: 'Unknown',
        email: emailMatch ? emailMatch[0] : 'unknown@email.com',
        phone: phoneMatch ? phoneMatch[0] : '',
        address: '',
        summary: '',
        education: [],
        experience: [],
        skills: {
          technical: [],
          soft: [],
          languages: [],
          tools: []
        },
        projects: [],
        certifications: [],
        awards: [],
        publications: [],
        volunteer: [],
      };
    } catch (error) {
      this.logger.error('Fallback parsing also failed:', error);
      return {
        name: 'Unknown',
        email: 'unknown@email.com',
        phone: '',
        address: '',
        summary: '',
        education: [],
        experience: [],
        skills: {
          technical: [],
          soft: [],
          languages: [],
          tools: []
        },
        projects: [],
        certifications: [],
        awards: [],
        publications: [],
        volunteer: [],
      };
    }
  }

  private fallbackProjectBullets(project: {
    name: string;
    role: string;
    techStack: string[];
    results?: string;
  }): string[] {
    return [
      `Developed ${project.name} using ${project.techStack.join(', ')}`,
      `Collaborated with team to deliver high-quality solutions`,
      project.results ? `Achieved ${project.results}` : 'Delivered project on time and within budget',
    ];
  }

  private fallbackSuggestions(): string[] {
    return [
      'Consider adding more quantifiable results to your experience',
      'Ensure all skills mentioned are relevant to your target roles',
      'Add a professional summary highlighting your key strengths',
      'Include relevant certifications and training',
      'Optimize your CV for ATS systems',
    ];
  }

  private fallbackJobKeywords(jobDescription: string): {
    skills: string[];
    requirements: string[];
    keywords: string[];
  } {
    // Basic keyword extraction using common patterns
    const commonSkills = ['JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'AWS', 'Docker'];
    const foundSkills = commonSkills.filter(skill => 
      jobDescription.toLowerCase().includes(skill.toLowerCase())
    );

    return {
      skills: foundSkills,
      requirements: ['Experience', 'Skills', 'Education'],
      keywords: foundSkills,
    };
  }

  async tailorCvContent(cvData: any, jobDescription: string): Promise<any> {
    try {
      // Use Google AI service to tailor CV content
      const tailoredData = await this.googleAIService.tailorCvContent(cvData, jobDescription);
      return tailoredData;
    } catch (error) {
      this.logger.error('Error tailoring CV content:', error);
      // Return original data if tailoring fails
      return cvData;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}