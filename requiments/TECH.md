## **Ý tưởng phát triển kỹ thuật cho Resumate**

### **1. Kiến trúc hệ thống**

**Frontend:**
- **React/Next.js** với TypeScript
- **Tailwind CSS** cho UI
- **Framer Motion** cho animation
- **React Query** cho state management

**Backend:**
- **Nest.js**
- **PostgreSQL** cho dữ liệu chính
- **Redis** cho cache
- **AWS S3** cho file storage

**AI/ML:**
- **OpenAI GPT-4** cho CV parsing và content generation
- **LangChain** cho prompt engineering
- **spaCy** cho NLP processing

### **2. Core Features Implementation**

**CV Parsing Engine:**
```typescript
// CV Parser Service
interface CVParser {
  parsePDF(file: File): Promise<CVData>
  parseDOCX(file: File): Promise<CVData>
  extractSkills(text: string): string[]
  extractExperience(text: string): Experience[]
}
```

**AI Content Generator:**
```typescript
// AI Service
interface AIService {
  generateProjectBullets(project: Project): Promise<string[]>
  tailorCVForJD(cv: CVData, jd: string): Promise<CVData>
  suggestImprovements(cv: CVData): Promise<Suggestion[]>
}
```

### **3. Database Schema**

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  name VARCHAR(255),
  created_at TIMESTAMP
);

-- CVs table
CREATE TABLE cvs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  original_file_url TEXT,
  parsed_data JSONB,
  version INTEGER DEFAULT 1
);

-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name VARCHAR(255),
  role VARCHAR(255),
  tech_stack TEXT[],
  results TEXT,
  cv_bullets TEXT[]
);
```

### **4. API Endpoints**

```typescript
// Core API Routes
POST /api/cv/upload          // Upload & parse CV
GET  /api/cv/:id             // Get CV data
PUT  /api/cv/:id             // Update CV
POST /api/projects           // Add new project
GET  /api/projects           // List projects
POST /api/job-tailor         // Generate tailored CV
GET  /api/portfolio/:username // Get portfolio
```

### **5. Advanced Features**

**Real-time Collaboration:**
- **WebSocket** cho real-time CV editing
- **Operational Transform** cho conflict resolution

**Analytics Dashboard:**
- **Chart.js** cho visualization
- Track CV performance, job application success rate

**Integration APIs:**
- **LinkedIn API** để import profile
- **GitHub API** để lấy project data
- **Job boards API** để auto-apply

### **6. Deployment & DevOps**

**Infrastructure:**
- **Docker** containerization
- **Kubernetes** cho scaling
- **AWS/GCP** cloud hosting
- **CDN** cho static assets

**CI/CD:**
- **GitHub Actions** cho automation
- **Automated testing** với Jest/Cypress
- **Code quality** với ESLint/Prettier

### **7. Security & Performance**

**Security:**
- **JWT** authentication
- **Rate limiting** cho API
- **File validation** cho uploads
- **GDPR compliance** cho data privacy

**Performance:**
- **Redis caching** cho frequent queries
- **CDN** cho static files
- **Database indexing** optimization
- **Lazy loading** cho UI components

### **8. File Processing Pipeline**

**File Upload Service:**
```typescript
interface FileUploadService {
  uploadFile(file: Buffer): Promise<string>
  validateFileType(file: Express.Multer.File): boolean
  optimizeFileSize(file: Buffer): Buffer
  deleteFile(fileUrl: string): Promise<void>
}

// Implementation
@Injectable()
export class FileUploadService {
  async uploadFile(file: Buffer): Promise<string> {
    const key = `cvs/${uuid()}-${Date.now()}`;
    await this.s3.upload({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: file,
      ContentType: 'application/pdf'
    }).promise();
    return `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/${key}`;
  }
}
```

**PDF/DOCX Parser:**
```typescript
interface DocumentParser {
  parsePDF(buffer: Buffer): Promise<string>
  parseDOCX(buffer: Buffer): Promise<string>
  extractText(filePath: string): Promise<string>
}

@Injectable()
export class DocumentParserService {
  async parsePDF(buffer: Buffer): Promise<string> {
    const data = await pdfParse(buffer);
    return data.text;
  }

  async parseDOCX(buffer: Buffer): Promise<string> {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }
}
```

### **9. Rate Limiting & Freemium Model**

**Rate Limit Service:**
```typescript
interface RateLimitService {
  checkUserLimit(userId: string, feature: string): Promise<boolean>
  incrementUsage(userId: string, feature: string): Promise<void>
  getUserUsage(userId: string): Promise<UserUsage>
}

@Injectable()
export class RateLimitService {
  async checkUserLimit(userId: string, feature: string): Promise<boolean> {
    const user = await this.userService.findById(userId);
    const usage = await this.getUserUsage(userId);
    
    const limits = {
      free: { cvUploads: 1, projects: 3, jobTailors: 5 },
      pro: { cvUploads: -1, projects: -1, jobTailors: -1 }
    };
    
    const userLimit = limits[user.plan][feature];
    return userLimit === -1 || usage[feature] < userLimit;
  }
}
```

**Usage Tracking:**
```typescript
@Entity('user_usage')
export class UserUsage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ default: 0 })
  cvUploads: number;

  @Column({ default: 0 })
  projects: number;

  @Column({ default: 0 })
  jobTailors: number;

  @Column({ default: 0 })
  exports: number;

  @Column({ type: 'date' })
  resetDate: Date;
}
```

### **10. Export Service Implementation**

**Export Service:**
```typescript
interface ExportService {
  exportToPDF(cvData: CVData, template: string): Promise<Buffer>
  exportToWord(cvData: CVData): Promise<Buffer>
  exportToATS(cvData: CVData): Promise<Buffer>
  generatePortfolioHTML(cvData: CVData, projects: Project[]): Promise<string>
}

@Injectable()
export class ExportService {
  async exportToPDF(cvData: CVData, template: string): Promise<Buffer> {
    const html = await this.generateHTML(cvData, template);
    return this.htmlToPDF(html);
  }

  async exportToATS(cvData: CVData): Promise<Buffer> {
    // ATS-friendly format (plain text, no fancy formatting)
    const atsContent = this.formatForATS(cvData);
    return Buffer.from(atsContent, 'utf-8');
  }

  private formatForATS(cvData: CVData): string {
    return `
${cvData.name}
${cvData.email} | ${cvData.phone}

EXPERIENCE
${cvData.experience.map(exp => 
  `${exp.role} at ${exp.company} (${exp.duration})
${exp.description}`
).join('\n\n')}

SKILLS
${cvData.skills.join(', ')}

EDUCATION
${cvData.education.map(edu => 
  `${edu.degree} - ${edu.school} (${edu.year})`
).join('\n')}
    `.trim();
  }
}
```

### **11. Error Handling & Resilience**

**Error Handling Strategy:**
```typescript
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message;
    }

    // Log error for monitoring
    this.logger.error(`${request.method} ${request.url}`, exception);

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}
```

**AI Service Resilience:**
```typescript
@Injectable()
export class AiService {
  async parseCvWithRetry(fileBuffer: Buffer, maxRetries = 3): Promise<any> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.parseCv(fileBuffer);
      } catch (error) {
        if (attempt === maxRetries) {
          // Fallback to basic parsing
          return this.fallbackParsing(fileBuffer);
        }
        await this.delay(1000 * attempt); // Exponential backoff
      }
    }
  }

  private fallbackParsing(fileBuffer: Buffer): any {
    // Basic regex-based parsing when AI fails
    return {
      name: 'Unknown',
      email: 'unknown@email.com',
      skills: [],
      experience: [],
      education: []
    };
  }
}
```

### **12. MVP Development Plan**

**Phase 1 (4-6 weeks):**
- Basic CV upload & parsing
- Simple project management
- Basic AI content generation
- File processing pipeline
- Rate limiting system

**Phase 2 (6-8 weeks):**
- Job tailoring feature
- Portfolio generation
- Export functionality (PDF, Word, ATS)
- Error handling & resilience

**Phase 3 (4-6 weeks):**
- Advanced AI features
- Analytics dashboard
- Mobile app
- Performance optimization
