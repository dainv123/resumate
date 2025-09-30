import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class GoogleAIService {
  private readonly logger = new Logger(GoogleAIService.name);
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GOOGLE_AI_API_KEY');
    const modelName = this.configService.get<string>('GOOGLE_AI_MODEL') || 'gemini-2.0-flash';
    
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

  async generateBulletPoints(description: string, role: string, techStack: string[]): Promise<string[]> {
    try {
      const prompt = `
        Generate 3-5 professional bullet points for a CV based on this project:
        
        Role: ${role}
        Technologies: ${techStack.join(', ')}
        Description: ${description}
        
        Requirements:
        - Start with action verbs
        - Include quantifiable results if possible
        - Focus on technical achievements
        - Keep each bullet point concise (1-2 lines)
        - Make them ATS-friendly
        
        Return as a JSON array of strings.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();
      
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        // Fallback: split by lines and clean up
        const lines = responseText.split('\n').filter(line => 
          line.trim().startsWith('-') || 
          line.trim().startsWith('•') ||
          line.trim().match(/^\d+\./)
        );
        return lines.map(line => line.replace(/^[-•\d.\s]+/, '').trim()).filter(Boolean);
      }
      
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      this.logger.error('Error generating bullet points:', error);
      // Fallback bullet points
      return [
        `Developed ${description.toLowerCase()}`,
        `Utilized ${techStack.slice(0, 3).join(', ')} technologies`,
        `Collaborated with team to deliver high-quality solutions`
      ];
    }
  }

  async tailorCvContent(cvData: any, jobDescription: string): Promise<any> {
    try {
      const prompt = `
        Tailor this CV data to match the job description:
        
        Job Description:
        ${jobDescription}
        
        Current CV Data:
        ${JSON.stringify(cvData, null, 2)}
        
        Requirements:
        1. Analyze the job requirements and identify key skills, technologies, and experience needed
        2. Reorder and emphasize relevant experience
        3. Add missing keywords from the job description
        4. Optimize the summary to match the role
        5. Highlight relevant projects and achievements
        6. Ensure ATS compatibility
        
        Return the tailored CV data as a JSON object with the same structure as the input.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();
      
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in tailored response');
      }
      
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      this.logger.error('Error tailoring CV content:', error);
      throw error;
    }
  }

  async parseCvContent(text: string): Promise<any> {
    try {
      const prompt = `
        Parse this CV text and extract **ALL** structured information. Be *extremely* thorough and extract every single detail, no matter how minor. The goal is 100% data fidelity.

        **CV Text:**
        ${text}

        ---

        **CRITICAL EXTRACTION REQUIREMENTS - ENSURE DATA COMPLETENESS:**

        1. **Personal Information**: Name, Email, Phone, Location/Address, **LinkedIn URL**, **Date of Birth**.
        2. **About Me/Summary**: Extract the complete professional summary (exact wording).
        3. **Work Experience**: For **EACH** job, extract:
           * Company Name (exact)
           * Job Title (exact)
           * Employment Period (exact dates/duration)
           * Company Description & **Team Size** (if mentioned)
           * **Tech Stack**: Extract **ALL** technologies mentioned, including specific libraries (e.g., Ant Design, Jest, Cypress).
           * **Responsibilities**: Extract **ALL** bullet points or details.
           * **Achievements**: Extract **ALL** listed achievements, quantifying results (e.g., percentages, metrics).
           * **Special Note for Projects/Sub-roles (e.g., Sutrix):** Treat internal projects or distinct roles within one company's entry as detailed **sub-sections**, ensuring the responsibilities and tech stack for **EACH** sub-section (like Globe, Chugai) are captured.

        4. **Education**: Degree, School, Year/Duration, Location, and any Honors/Awards.
        5. **Skills**: Extract **ALL** skills with **years of experience** if mentioned (e.g., "ReactJS (5 years)"). Organize them into appropriate categories.
        6. **Projects (Highlight)**: Name, Duration, Description, **Comprehensive Tech Stack** (including unique infrastructure tech like MongoDB Atlas, Amazon S3, Route 53, Docusaurus), Results, and Link.
        7. **Certifications**: Name, Issuer, Date/Expiry, and Certificate Links.
        8. **Additional Info**: Any other relevant, uncategorized details.

        ---

        **EXTRACTION RULES & JSON INSTRUCTION:**

        * **Data Integrity:** Extract **EVERY** detail. If dates, team sizes, or specific links (view certificate, view project) are present, **they must be extracted**.
        * **Exact Wording:** Preserve exact wording for job titles, company names, achievements, and the summary.
        * **Handle Ambiguity:** Be flexible with headings (e.g., 'EXPERIENCE' vs 'WORK HISTORY').
        * **JSON Output:** Return **only** the JSON object using the exact structure provided below.
        * **Mandatory Keys:** If a section or field is not present in the CV, use an **empty array \`[]\`** for list fields or **\`null\`** (or empty string \`""\`) for string fields. **DO NOT OMIT ANY TOP-LEVEL KEY OR MANDATORY NESTED KEY**.

        Extract and return a JSON object with this comprehensive structure:
        {
          "name": "Full Name",
          "email": "email@example.com",
          "phone": "phone number",
          "address": "address",
          "linkedin": "url (optional)",
          "dateOfBirth": "date (optional)",
          "summary": "professional summary",
          "education": [
            {
              "degree": "Degree Name",
              "school": "School Name",
              "year": "Graduation Year/Duration",
              "location": "School Location (optional)",
              "honors": "Honors/Awards (optional)"
            }
          ],
          "experience": [
            {
              "title": "Job Title",
              "company": "Company Name",
              "duration": "Start Date - End Date",
              "teamSize": "Team Size (optional)",
              "companyDescription": "Description (optional)",
              "responsibilities": ["responsibility 1", "responsibility 2"],
              "achievements": ["achievement 1", "achievement 2"],
              "technologies": ["tech1", "tech2"],
              "subProjects": [
                {
                  "name": "Sub Project Name (optional)",
                  "role": "Role in Sub Project (optional)",
                  "techStack": ["tech1"],
                  "responsibilities": ["sub-responsibility 1"]
                }
              ]
            }
          ],
          "skills": {
            "technical": ["skill1 (years)", "skill2 (years)"],
            "soft": ["skill1", "skill2"],
            "tools": ["tool1", "tool2"],
            "languages": ["language1", "language2"]
          },
          "projects": [
            {
              "name": "Project Name",
              "duration": "Duration (optional)",
              "description": "Project description",
              "techStack": ["tech1", "tech2"],
              "results": "Project results",
              "link": "Project link (optional)"
            }
          ],
          "certifications": [
            {
              "name": "Certification Name",
              "issuer": "Issuing Organization",
              "date": "Issue Date/Expiry Date",
              "link": "Certificate Link (optional)"
            }
          ],
          "awards": [],
          "publications": [],
          "volunteer": []
        }
        
        **CRITICAL EXTRACTION INSTRUCTIONS:**
        - Extract EVERY SINGLE detail from the CV - nothing should be missed
        - If a section is not present, use empty array []
        - Be extremely detailed and thorough
        - Handle different CV formats: chronological, functional, combination, academic, technical, etc.
        - Look for information in headers, bullet points, paragraphs, tables, and any other format
        - If dates are in different formats (MM/YYYY, Month YYYY, etc.), standardize them
        - If skills are listed with years of experience, extract both skill and years
        - Extract ALL technologies mentioned in tech stacks
        - Extract ALL achievements and responsibilities for each job
        - Don't miss any skills, experiences, achievements, or details
        - Extract team sizes, company descriptions, project links, certificate links
        - Focus on extracting detailed tech stack and achievements for work experience
        - Organize skills into technical, soft, languages, and tools categories
        - Extract project details with tech stack, duration, and results
        - Include years of experience for skills if mentioned
        - Extract ALL bullet points under responsibilities and achievements
        - **MOST IMPORTANT**: Extract ALL achievements, responsibilities, and tech stacks for each job
        - Extract company descriptions and team sizes
        - Extract ALL project details including subprojects
        - Extract ALL certification details including issuer and date
        - Extract ALL education details including location
        - Extract ALL personal information including LinkedIn and date of birth
        - Return only the JSON object, no additional text
        
        **EXAMPLE OF DETAILED EXTRACTION:**
        For a job like "Senior Full Stack Developer at Rakkar Digital (05/2024 - NOW)", extract:
        - Company: "Rakkar Digital"
        - Title: "Senior Full Stack Developer" 
        - Period: "05/2024 - NOW"
        - Company Description: "Asia's leading digital asset custodian delivering ultra-secure crypto custody, backed by SCB 10X"
        - Team Size: "4 (Full-stack team)"
        - Tech Stack: ["NestJS", "Node.js", "TypeScript", "Go", "Jest", "WebSockets", "React.js", "TypeScript", "Ant Design", "Redux", "GraphQL", "Jest", "Cypress", "PostgreSQL", "MongoDB", "Redis", "AWS", "GCP", "Kubernetes", "Docker", "Datadog", "CI/CD", "Microservices", "BFF architecture"]
        - Responsibilities: ["Developed new features and enhanced existing functionality", "Built and optimized frontend applications", "Assisted in migrating legacy modules to microservices", "Implemented and maintained automated testing pipelines", "Monitored CI/CD pipelines on AWS/GCP", "Ensured code quality and security compliance", "Collaborated with international teams", "Supported team members and contributed to cross-team knowledge sharing"]
        - Achievements: ["Improved API latency by 32-44% across critical endpoints", "Improved test coverage to 70%+ across core modules", "Supported platform stability for successful Securities and Exchange Commission compliance", "Participated in building the custody product app for Fireblocks MPC-CMP", "Co-developed the BFF layer, enabling decoupled frontend-backend communication", "Built a dynamic report system, allowing the product team to configure and generate reports independently, speeding up development"]
        
        EXAMPLES OF DIFFERENT FORMATS TO HANDLE:
        - "Work Experience" vs "Professional Experience" vs "Employment History"
        - "Skills" vs "Technical Skills" vs "Core Competencies" vs "Expertise"
        - "Education" vs "Academic Background" vs "Qualifications"
        - "Projects" vs "Portfolio" vs "Key Projects"
        - "Certifications" vs "Licenses" vs "Professional Certifications"
      `;

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
      name: data.name || '',
      email: data.email || '',
      phone: data.phone || '',
      address: data.address || '',
      linkedin: data.linkedin || '',
      dateOfBirth: data.dateOfBirth || '',
      summary: data.summary || '',
      education: Array.isArray(data.education) ? data.education.map(edu => ({
        degree: edu.degree || edu.qualification || edu.certificate || '',
        school: edu.school || edu.university || edu.institution || edu.college || '',
        year: edu.year || edu.graduationYear || edu.date || '',
        gpa: edu.gpa || edu.grade || '',
        location: edu.location || edu.place || '',
        honors: edu.honors || edu.awards || edu.achievements || ''
      })) : [],
      experience: Array.isArray(data.experience) ? data.experience.map(exp => ({
        title: exp.title || exp.role || exp.position || '',
        company: exp.company || exp.employer || '',
        duration: exp.duration || exp.period || exp.timeframe || '',
        teamSize: exp.teamSize || '',
        companyDescription: exp.companyDescription || '',
        responsibilities: Array.isArray(exp.responsibilities) ? exp.responsibilities : [],
        achievements: Array.isArray(exp.achievements) ? exp.achievements : [],
        technologies: Array.isArray(exp.technologies) ? exp.technologies : [],
        subProjects: Array.isArray(exp.subProjects) ? exp.subProjects.map(sub => ({
          name: sub.name || '',
          role: sub.role || '',
          techStack: Array.isArray(sub.techStack) ? sub.techStack : [],
          responsibilities: Array.isArray(sub.responsibilities) ? sub.responsibilities : [],
        })) : []
      })) : [],
      skills: {
        technical: Array.isArray(data.skills?.technical) ? data.skills.technical : [],
        soft: Array.isArray(data.skills?.soft) ? data.skills.soft : [],
        languages: Array.isArray(data.skills?.languages) ? data.skills.languages : [],
        tools: Array.isArray(data.skills?.tools) ? data.skills.tools : []
      },
      projects: Array.isArray(data.projects) ? data.projects.map(project => ({
        name: project.name || '',
        duration: project.duration || '',
        description: project.description || '',
        techStack: Array.isArray(project.techStack) ? project.techStack : [],
        results: project.results || '',
        link: project.link || '',
      })) : [],
      certifications: Array.isArray(data.certifications) ? data.certifications.map(cert => ({
        name: cert.name || '',
        issuer: cert.issuer || '',
        date: cert.date || cert.issueDate || '',
        link: cert.link || cert.certificateLink || '',
      })) : [],
      awards: Array.isArray(data.awards) ? data.awards : [],
      publications: Array.isArray(data.publications) ? data.publications : [],
      volunteer: Array.isArray(data.volunteer) ? data.volunteer : []
    };

    // Handle skills if it's an array instead of object
    if (Array.isArray(data.skills) && data.skills.length > 0) {
      const technicalKeywords = ['programming', 'development', 'coding', 'software', 'technical', 'programming', 'database', 'web', 'mobile', 'cloud', 'devops', 'ai', 'ml', 'data', 'analytics'];
      const softKeywords = ['leadership', 'communication', 'teamwork', 'management', 'problem', 'creative', 'analytical', 'interpersonal', 'presentation', 'negotiation'];
      const languageKeywords = ['english', 'spanish', 'french', 'german', 'chinese', 'japanese', 'korean', 'arabic', 'portuguese', 'italian', 'russian'];
      
      data.skills.forEach(skill => {
        const skillLower = skill.toLowerCase();
        if (technicalKeywords.some(keyword => skillLower.includes(keyword))) {
          cleanedData.skills.technical.push(skill);
        } else if (softKeywords.some(keyword => skillLower.includes(keyword))) {
          cleanedData.skills.soft.push(skill);
        } else if (languageKeywords.some(keyword => skillLower.includes(keyword))) {
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
      • Best UX Design, TechCrunch, 2021`
    ];

    const results: any[] = [];
    for (const cvText of testCvTexts) {
      try {
        const parsed = await this.parseCvContent(cvText);
        results.push({
          format: 'Test CV',
          success: true,
          data: parsed
        });
      } catch (error) {
        results.push({
          format: 'Test CV',
          success: false,
          error: error.message
        });
      }
    }
    
    return results;
  }

  async generateSuggestions(cvData: any): Promise<string[]> {
    try {
      const prompt = `
        Analyze this CV and provide 5-7 improvement suggestions:
        
        CV Data:
        ${JSON.stringify(cvData, null, 2)}
        
        Focus on:
        - ATS optimization
        - Keyword enhancement
        - Experience improvement
        - Skills alignment
        - Format and structure
        
        Return as a JSON array of suggestion strings.
      `;

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
          'Ensure consistent formatting throughout'
        ];
      }
      
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      this.logger.error('Error generating suggestions:', error);
      return [
        'Add quantifiable achievements to your experience',
        'Include relevant keywords from job descriptions',
        'Optimize your professional summary'
      ];
    }
  }

  async extractKeywords(jobDescription: string): Promise<string[]> {
    try {
      const prompt = `
        Extract key skills, technologies, and requirements from this job description:
        
        Job Description:
        ${jobDescription}
        
        Return a JSON array of the most important keywords, skills, and technologies mentioned.
        Focus on technical skills, soft skills, tools, and frameworks.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();
      
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        // Fallback: extract common keywords
        const commonKeywords = [
          'JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'Git',
          'Communication', 'Teamwork', 'Problem Solving', 'Leadership'
        ];
        return commonKeywords.filter(keyword => 
          jobDescription.toLowerCase().includes(keyword.toLowerCase())
        );
      }
      
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      this.logger.error('Error extracting keywords:', error);
      return [];
    }
  }
}