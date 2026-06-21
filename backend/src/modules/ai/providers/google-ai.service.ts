import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getAIPrompt, Language } from '../translations/ai-prompts';
import {
  INTERVIEW_PREP_AI_PROMPTS,
  fillInterviewPrepPrompt,
} from '../prompts/interview-prep.prompts';

@Injectable()
export class GoogleAIService {
  private readonly logger = new Logger(GoogleAIService.name);
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GOOGLE_AI_API_KEY');
    const modelName =
      this.configService.get<string>('GOOGLE_AI_MODEL') || 'gemini-2.0-flash';

    if (!apiKey) {
      throw new Error('Google AI API key is not configured');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: modelName });
  }

  async generateStructuredData(prompt: string, schema: any): Promise<any> {
    try {
      const fullPrompt = `${prompt}\n\nPlease respond with a valid JSON object that matches this schema: ${JSON.stringify(schema)}`;

      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      const responseText = response.text();

      // Extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      this.logger.error('Error generating structured data:', error);
      throw error;
    }
  }

  async generateBulletPoints(
    description: string,
    role: string,
    techStack: string[],
    language: Language = 'en',
  ): Promise<string[]> {
    try {
      const template = getAIPrompt(language, 'generateBulletPoints');
      const prompt = template
        .replace('{{role}}', role)
        .replace('{{techStack}}', techStack.join(', '))
        .replace('{{description}}', description);

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();

      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        // Fallback: split by lines and clean up
        const lines = responseText
          .split('\n')
          .filter(
            (line) =>
              line.trim().startsWith('-') ||
              line.trim().startsWith('•') ||
              line.trim().match(/^\d+\./),
          );
        return lines
          .map((line) => line.replace(/^[-•\d.\s]+/, '').trim())
          .filter(Boolean);
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      this.logger.error('Error generating bullet points:', error);
      // Fallback bullet points
      return [
        `Developed ${description.toLowerCase()}`,
        `Utilized ${techStack.slice(0, 3).join(', ')} technologies`,
        `Collaborated with team to deliver high-quality solutions`,
      ];
    }
  }

  async tailorCvContent(
    cvData: any,
    jobDescription: string,
    language: Language = 'en',
  ): Promise<any> {
    try {
      // Try with requested language first
      let template = getAIPrompt(language, 'tailorCvContent');
      let prompt = template
        .replace('{{jobDescription}}', jobDescription)
        .replace('{{cvData}}', JSON.stringify(cvData, null, 2));

      this.logger.log('=== AI TAILOR PROMPT ===');
      this.logger.log(prompt);
      this.logger.log('=== END AI TAILOR PROMPT ===');

      let result = await this.model.generateContent(prompt);
      let response = await result.response;
      let responseText = response.text();

      // Debug logging
      this.logger.log('=== AI TAILOR RESPONSE ===');
      this.logger.log(responseText);
      this.logger.log('=== END AI RESPONSE ===');

      let jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        // If no JSON found and language is not English, try with English
        if (language !== 'en') {
          this.logger.log(
            'No JSON found in response, trying with English prompt...',
          );
          template = getAIPrompt('en', 'tailorCvContent');
          prompt = template
            .replace('{{jobDescription}}', jobDescription)
            .replace('{{cvData}}', JSON.stringify(cvData, null, 2));

          result = await this.model.generateContent(prompt);
          response = await result.response;
          responseText = response.text();

          this.logger.log('=== AI TAILOR RESPONSE (ENGLISH FALLBACK) ===');
          this.logger.log(responseText);
          this.logger.log('=== END AI RESPONSE ===');

          jsonMatch = responseText.match(/\{[\s\S]*\}/);
        }

        if (!jsonMatch) {
          throw new Error('No valid JSON found in tailored response');
        }
      }

      const tailoredData = JSON.parse(jsonMatch[0]);

      // Debug logging
      this.logger.log('=== PARSED TAILORED DATA ===');
      this.logger.log(JSON.stringify(tailoredData, null, 2));
      this.logger.log('=== END PARSED DATA ===');

      // Debug logging before restructure
      this.logger.log('=== BEFORE RESTRUCTURE ===');
      this.logger.log(`Has name: ${!!tailoredData.name}`);
      this.logger.log(`Has contact: ${!!tailoredData.contact}`);
      this.logger.log(`Keys: ${Object.keys(tailoredData).join(', ')}`);

      // Ensure the response maintains the standardized CVData structure
      // If AI flattened contact info, restructure it properly
      if (tailoredData.name && !tailoredData.contact) {
        this.logger.log('=== RESTRUCTURING FLATTENED DATA ===');
        tailoredData.contact = {
          name: tailoredData.name,
          email: tailoredData.email || '',
          phone: tailoredData.phone || '',
          address: tailoredData.address || '',
          linkedin: tailoredData.linkedin || '',
          github: tailoredData.github || '',
          website: tailoredData.website || '',
          location: tailoredData.location || '',
        };

        // Remove flattened fields
        delete tailoredData.name;
        delete tailoredData.email;
        delete tailoredData.phone;
        delete tailoredData.address;
        delete tailoredData.linkedin;
        delete tailoredData.github;
        delete tailoredData.website;
        delete tailoredData.location;

        this.logger.log('=== AFTER RESTRUCTURE ===');
        this.logger.log(`Has contact: ${!!tailoredData.contact}`);
        this.logger.log(
          `Contact keys: ${tailoredData.contact ? Object.keys(tailoredData.contact).join(', ') : 'none'}`,
        );
      } else {
        this.logger.log('=== NO RESTRUCTURE NEEDED ===');
      }

      return tailoredData;
    } catch (error) {
      this.logger.error('Error tailoring CV content:', error);
      throw error;
    }
  }

  async analyzeCompatibility(
    cvData: any,
    jobDescription: string,
    language: Language = 'en',
  ): Promise<{
    score: number;
    matchedSkills: string[];
    missingSkills: string[];
    matchedExperience: string[];
    missingRequirements: string[];
    suggestions: string[];
    strengths: string[];
    reused?: boolean;
  }> {
    try {
      const template = getAIPrompt(language, 'analyzeCompatibility');
      const prompt = template
        .replace('{{jobDescription}}', jobDescription)
        .replace('{{cvData}}', JSON.stringify(cvData, null, 2));

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();

      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in compatibility analysis');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      this.logger.error('Error analyzing compatibility:', error);
      throw error;
    }
  }

  async generateCoverLetter(
    cvData: any,
    jobDescription: string,
    language: Language = 'en',
  ): Promise<{ coverLetter: string; reused?: boolean }> {
    try {
      const template = getAIPrompt(language, 'generateCoverLetter');
      const prompt = template
        .replace('{{jobDescription}}', jobDescription)
        .replace('{{name}}', cvData.contact?.name || cvData.name || 'Candidate')
        .replace('{{email}}', cvData.contact?.email || cvData.email || '')
        .replace('{{summary}}', cvData.summary || '')
        .replace('{{skills}}', JSON.stringify(cvData.skills))
        .replace(
          '{{experience}}',
          JSON.stringify(cvData.experience?.slice(0, 3)),
        )
        .replace(
          '{{education}}',
          JSON.stringify(cvData.education?.slice(0, 2)),
        );

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return { coverLetter: response.text() };
    } catch (error) {
      this.logger.error('Error generating cover letter:', error);
      throw error;
    }
  }

  async parseCvContent(text: string, language: Language = 'en'): Promise<any> {
    try {
      const template = getAIPrompt(language, 'parseCvContent');
      const prompt = template.replace('{{cvText}}', text);

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();

      // Log the raw AI response for debugging
      this.logger.log('=== AI RAW RESPONSE ===');
      this.logger.log(responseText);
      this.logger.log('=== END AI RESPONSE ===');

      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in CV parsing response');
      }

      const parsedData = JSON.parse(jsonMatch[0]);

      // Log the parsed data for debugging
      this.logger.log('=== PARSED DATA ===');
      this.logger.log(JSON.stringify(parsedData, null, 2));
      this.logger.log('=== END PARSED DATA ===');

      // Clean up and validate the parsed data
      const cleanedData = this.cleanupParsedData(parsedData);

      // Log the cleaned data for debugging
      this.logger.log('=== CLEANED DATA ===');
      this.logger.log(JSON.stringify(cleanedData, null, 2));
      this.logger.log('=== END CLEANED DATA ===');

      return cleanedData;
    } catch (error) {
      this.logger.error('Error parsing CV content:', error);
      throw error;
    }
  }

  private cleanupParsedData(data: any): any {
    // Preserve all original data and only ensure structure consistency
    const cleanedData = {
      contact: {
        name: data.contact?.name || data.name || '',
        email: data.contact?.email || data.email || '',
        phone: data.contact?.phone || data.phone || '',
        address: data.contact?.address || data.address || '',
        linkedin: data.contact?.linkedin || data.linkedin || '',
        github: data.contact?.github || data.github || '',
        website: data.contact?.website || data.website || '',
        location: data.contact?.location || data.location || '',
      },
      dateOfBirth: data.dateOfBirth || '',
      summary: data.summary || '',
      education: Array.isArray(data.education)
        ? data.education.map((edu) => ({
            degree: edu.degree || edu.qualification || edu.certificate || '',
            school:
              edu.school ||
              edu.university ||
              edu.institution ||
              edu.college ||
              '',
            year: edu.year || edu.graduationYear || edu.date || '',
            gpa: edu.gpa || edu.grade || '',
            location: edu.location || edu.place || '',
            honors: edu.honors || edu.awards || edu.achievements || '',
          }))
        : [],
      experience: Array.isArray(data.experience)
        ? data.experience.map((exp) => ({
            title: exp.title || exp.role || exp.position || '',
            company: exp.company || exp.employer || '',
            duration: exp.duration || exp.period || exp.timeframe || '',
            teamSize: exp.teamSize || '',
            companyDescription: exp.companyDescription || '',
            responsibilities: Array.isArray(exp.responsibilities)
              ? exp.responsibilities
              : [],
            achievements: Array.isArray(exp.achievements)
              ? exp.achievements
              : [],
            technologies: Array.isArray(exp.technologies)
              ? exp.technologies
              : [],
            subProjects: Array.isArray(exp.subProjects)
              ? exp.subProjects.map((sub) => ({
                  name: sub.name || '',
                  role: sub.role || '',
                  techStack: Array.isArray(sub.techStack) ? sub.techStack : [],
                  responsibilities: Array.isArray(sub.responsibilities)
                    ? sub.responsibilities
                    : [],
                }))
              : [],
          }))
        : [],
      skills: {
        technical: Array.isArray(data.skills?.technical)
          ? data.skills.technical
          : [],
        soft: Array.isArray(data.skills?.soft) ? data.skills.soft : [],
        languages: Array.isArray(data.skills?.languages)
          ? data.skills.languages
          : [],
        tools: Array.isArray(data.skills?.tools) ? data.skills.tools : [],
      },
      projects: Array.isArray(data.projects)
        ? data.projects.map((project) => ({
            name: project.name || '',
            duration: project.duration || '',
            description: project.description || '',
            techStack: Array.isArray(project.techStack)
              ? project.techStack
              : [],
            results: project.results || '',
            link: project.link || '',
          }))
        : [],
      certifications: Array.isArray(data.certifications)
        ? data.certifications.map((cert) => ({
            name: cert.name || '',
            issuer: cert.issuer || '',
            date: cert.date || cert.issueDate || '',
            link: cert.link || cert.certificateLink || '',
          }))
        : [],
      awards: Array.isArray(data.awards) ? data.awards : [],
      publications: Array.isArray(data.publications) ? data.publications : [],
      volunteer: Array.isArray(data.volunteer) ? data.volunteer : [],
    };

    // Handle skills if it's an array instead of object
    if (Array.isArray(data.skills) && data.skills.length > 0) {
      const technicalKeywords = [
        'programming',
        'development',
        'coding',
        'software',
        'technical',
        'programming',
        'database',
        'web',
        'mobile',
        'cloud',
        'devops',
        'ai',
        'ml',
        'data',
        'analytics',
      ];
      const softKeywords = [
        'leadership',
        'communication',
        'teamwork',
        'management',
        'problem',
        'creative',
        'analytical',
        'interpersonal',
        'presentation',
        'negotiation',
      ];
      const languageKeywords = [
        'english',
        'spanish',
        'french',
        'german',
        'chinese',
        'japanese',
        'korean',
        'arabic',
        'portuguese',
        'italian',
        'russian',
      ];

      data.skills.forEach((skill) => {
        const skillLower = skill.toLowerCase();
        if (technicalKeywords.some((keyword) => skillLower.includes(keyword))) {
          cleanedData.skills.technical.push(skill);
        } else if (
          softKeywords.some((keyword) => skillLower.includes(keyword))
        ) {
          cleanedData.skills.soft.push(skill);
        } else if (
          languageKeywords.some((keyword) => skillLower.includes(keyword))
        ) {
          cleanedData.skills.languages.push(skill);
        } else {
          cleanedData.skills.technical.push(skill);
        }
      });
    }

    return cleanedData;
  }

  // Test function to validate parsing with different CV formats
  async testParsingWithDifferentFormats(): Promise<any> {
    const testCvTexts = [
      // Academic CV format
      `John Doe
      john.doe@email.com
      +1-234-567-8900
      
      EDUCATION
      Ph.D. in Computer Science, Stanford University, 2020
      M.S. in Software Engineering, MIT, 2018
      B.S. in Computer Science, UC Berkeley, 2016
      
      RESEARCH EXPERIENCE
      Postdoctoral Researcher, Stanford AI Lab, 2020-2023
      - Published 15 papers in top-tier conferences
      - Led research on machine learning applications
      
      PUBLICATIONS
      "Deep Learning for CV Analysis", Nature, 2022
      "AI in Healthcare", Science, 2021`,

      // Technical CV format
      `Jane Smith
      jane.smith@tech.com
      (555) 123-4567
      
      PROFESSIONAL SUMMARY
      Senior Software Engineer with 8+ years experience in full-stack development
      
      TECHNICAL SKILLS
      Programming: Python, JavaScript, Java, C++
      Frameworks: React, Node.js, Django, Spring
      Databases: PostgreSQL, MongoDB, Redis
      Cloud: AWS, Azure, Docker, Kubernetes
      
      WORK EXPERIENCE
      Senior Software Engineer, Google, 2020-Present
      - Led development of microservices architecture
      - Improved system performance by 40%
      
      Software Engineer, Microsoft, 2018-2020
      - Developed web applications using React and Node.js
      - Collaborated with cross-functional teams`,

      // Creative CV format
      `Alex Johnson
      alex@creative.com
      555-987-6543
      
      CREATIVE DIRECTOR & UX DESIGNER
      
      CORE COMPETENCIES
      • User Experience Design
      • Brand Strategy
      • Team Leadership
      • Creative Direction
      
      PORTFOLIO
      • Redesigned mobile app for 2M+ users
      • Created brand identity for startup
      • Led design team of 12 designers
      
      AWARDS
      • Design Excellence Award, 2022
      • Best UX Design, TechCrunch, 2021`,
    ];

    const results: any[] = [];
    for (const cvText of testCvTexts) {
      try {
        const parsed = await this.parseCvContent(cvText);
        results.push({
          format: 'Test CV',
          success: true,
          data: parsed,
        });
      } catch (error) {
        results.push({
          format: 'Test CV',
          success: false,
          error: error.message,
        });
      }
    }

    return results;
  }

  async generateSuggestions(
    cvData: any,
    language: Language = 'en',
  ): Promise<string[]> {
    try {
      const template = getAIPrompt(language, 'generateSuggestions');
      const prompt = template.replace(
        '{{cvData}}',
        JSON.stringify(cvData, null, 2),
      );

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();

      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        // Fallback suggestions
        return [
          'Add quantifiable achievements to your experience',
          'Include relevant keywords from job descriptions',
          'Optimize your professional summary',
          'Highlight technical skills and certifications',
          'Ensure consistent formatting throughout',
        ];
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      this.logger.error('Error generating suggestions:', error);
      return [
        'Add quantifiable achievements to your experience',
        'Include relevant keywords from job descriptions',
        'Optimize your professional summary',
      ];
    }
  }

  async extractKeywords(
    jobDescription: string,
    language: Language = 'en',
  ): Promise<string[]> {
    try {
      const template = getAIPrompt(language, 'extractKeywords');
      const prompt = template.replace('{{jobDescription}}', jobDescription);

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();

      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        // Fallback: extract common keywords
        const commonKeywords = [
          'JavaScript',
          'Python',
          'React',
          'Node.js',
          'SQL',
          'Git',
          'Communication',
          'Teamwork',
          'Problem Solving',
          'Leadership',
        ];
        return commonKeywords.filter((keyword) =>
          jobDescription.toLowerCase().includes(keyword.toLowerCase()),
        );
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      this.logger.error('Error extracting keywords:', error);
      return [];
    }
  }
  async inferInterviewProcess(jobDescription: string): Promise<{
    rounds: Array<{
      type: string;
      label: string;
      durationMinutes: number;
      weight: number;
      focusAreas: string[];
    }>;
    totalEstimatedDays: number;
  }> {
    const prompt = fillInterviewPrepPrompt(INTERVIEW_PREP_AI_PROMPTS.inferInterviewProcess, {
      jobDescription,
    });

    return this.parseJsonObject(prompt);
  }

  async generateStarStories(
    cvData: unknown,
    jobDescription: string,
  ): Promise<
    Array<{
      id: string;
      question: string;
      mapsToQuestions: string[];
      situation: string;
      task: string;
      action: string;
      result: string;
      projectRef: string;
      ready: boolean;
    }>
  > {
    const prompt = fillInterviewPrepPrompt(INTERVIEW_PREP_AI_PROMPTS.generateStarStories, {
      jobDescription,
      cvData: JSON.stringify(cvData, null, 2),
    });

    return this.parseJsonArray(prompt);
  }

  async generateProjectDefenseSheets(
    cvData: unknown,
    jobDescription: string,
  ): Promise<
    Array<{
      projectName: string;
      role: string;
      architectureDecision: string;
      hardestProblem: string;
      outcome: string;
      wouldDoDifferently: string;
      followUpQuestions: string[];
    }>
  > {
    const prompt = fillInterviewPrepPrompt(INTERVIEW_PREP_AI_PROMPTS.generateProjectDefense, {
      jobDescription,
      cvData: JSON.stringify(cvData, null, 2),
    });

    return this.parseJsonArray(prompt);
  }

  async evaluateMockAnswer(
    question: string,
    rubric: { excellent: string[]; good: string[]; weak: string[] },
    answer: string,
  ): Promise<{
    score: number;
    matchedCriteria: string[];
    missingCriteria: string[];
    feedback: string;
  }> {
    const prompt = fillInterviewPrepPrompt(INTERVIEW_PREP_AI_PROMPTS.evaluateMockAnswer, {
      question,
      excellent: rubric.excellent.join('; '),
      good: rubric.good.join('; '),
      weak: rubric.weak.join('; '),
      answer,
    });

    return this.parseJsonObject(prompt);
  }

  private async parseJsonObject<T>(prompt: string): Promise<T> {
    const result = await this.model.generateContent(prompt);
    const responseText = result.response.text();
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON object in AI response');
    }
    return JSON.parse(jsonMatch[0]) as T;
  }

  private async parseJsonArray<T>(prompt: string): Promise<T[]> {
    const result = await this.model.generateContent(prompt);
    const responseText = result.response.text();
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No valid JSON array in AI response');
    }
    return JSON.parse(jsonMatch[0]) as T[];
  }
}
