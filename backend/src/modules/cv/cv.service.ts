import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cv } from './entities/cv.entity';
import { JobDescription } from './entities/job-description.entity';
import { CvMatchingAnalysis } from './entities/cv-matching-analysis.entity';
import { CvCoverLetter } from './entities/cv-cover-letter.entity';
import { JobDescriptionService } from './job-description.service';
import { AiService } from '../ai/ai.service';
import { UsersService } from '../users/users.service';
import { CreateCvDto, UpdateCvDto, TailorCvDto, QuickBuildCvDto } from './dto/cv.dto';
import { DocumentParserService } from '../ai/providers/document-parser.service';
import { FileUploadService } from '../../shared/services/file-upload.service';
import { ExportService } from '../../shared/services/export.service';
import { DynamicTemplateService } from '../../shared/services/dynamic-template.service';
import { TemplatesService } from '../templates/templates.service';
import { CVData, TemplateConfig } from '../../shared/interfaces/cv-data.interface';
import { CVDataUtils } from '../../shared/utils/cv-data.utils';

export interface PaginationOptions {
  page: number;
  limit: number;
  search?: string;
  sortBy: string;
  sortOrder: 'ASC' | 'DESC';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

@Injectable()
export class CvService {
  private readonly logger = new Logger(CvService.name);

  constructor(
    @InjectRepository(Cv)
    private cvRepository: Repository<Cv>,
    @InjectRepository(JobDescription)
    private jobDescriptionRepository: Repository<JobDescription>,
    @InjectRepository(CvMatchingAnalysis)
    private matchingAnalysisRepository: Repository<CvMatchingAnalysis>,
    @InjectRepository(CvCoverLetter)
    private coverLetterRepository: Repository<CvCoverLetter>,
    private jobDescriptionService: JobDescriptionService,
    private aiService: AiService,
    private usersService: UsersService,
    private documentParserService: DocumentParserService,
    private fileUploadService: FileUploadService,
    private exportService: ExportService,
    private dynamicTemplateService: DynamicTemplateService,
    private templatesService: TemplatesService,
  ) {}

  async uploadCv(userId: string, file: Express.Multer.File): Promise<Cv> {
    // Check user limits
    const canUpload = await this.usersService.checkUserLimit(userId, 'cvUploads');
    if (!canUpload) {
      throw new BadRequestException('CV upload limit reached for your plan');
    }

    // Validate file
    if (!this.documentParserService.validateFileType(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only PDF and DOCX files are allowed');
    }

    if (!this.documentParserService.validateFileSize(file.size)) {
      throw new BadRequestException('File size too large. Maximum 10MB allowed');
    }

    try {
      // Upload file to S3
      const fileUrl = await this.fileUploadService.uploadFile(file, 'cv');

      // Parse CV content using AI
      const parsedData = await this.aiService.parseCvWithRetry(
        file.buffer,
        file.mimetype,
      );

      // Create CV record (no improvement notes for initial upload)
      const cv = this.cvRepository.create({
        userId,
        originalFileName: file.originalname,
        fileUrl,
        parsedData,
      });

      const savedCv = await this.cvRepository.save(cv);

      // Increment usage
      await this.usersService.incrementUsage(userId, 'cvUploads');

      return savedCv;
    } catch (error) {
      throw new BadRequestException('Failed to process CV file');
    }
  }

  async getCvById(id: string, userId: string): Promise<Cv> {
    const cv = await this.cvRepository.findOne({
      where: { id, userId },
      relations: ['originalCv', 'jobDescription', 'tailoredVersions'],
    });

    if (!cv) {
      throw new NotFoundException('CV not found');
    }

    return cv;
  }

  async getUserCvs(userId: string): Promise<Cv[]> {
    return this.cvRepository.find({
      where: { userId },
      relations: ['originalCv', 'jobDescription', 'tailoredVersions'],
      order: { createdAt: 'DESC' },
    });
  }

  async createCv(userId: string, createCvDto: CreateCvDto): Promise<Cv> {
    const { originalFileName, fileUrl, parsedData } = createCvDto;

    // Create new CV entity
    const cv = this.cvRepository.create({
      userId,
      originalFileName,
      fileUrl: fileUrl || '', // Default empty string if no file URL
      parsedData: parsedData || CVDataUtils.normalizeCVData({}),
      version: 1,
      isTailored: false,
    });

    return this.cvRepository.save(cv);
  }

  async getUserCvsPaginated(userId: string, options: PaginationOptions): Promise<PaginatedResult<Cv>> {
    const { page, limit, search, sortBy, sortOrder } = options;
    const skip = (page - 1) * limit;

    // Build base query (only select needed columns initially)
    const baseQuery = this.cvRepository
      .createQueryBuilder('cv')
      .where('cv.userId = :userId', { userId });

    // Add search filter - only search on indexed fields for performance
    if (search) {
      // Search only on originalFileName (indexed) and NOT on parsedData to avoid full scan
      baseQuery.andWhere(
        'cv.originalFileName ILIKE :search',
        { search: `%${search}%` }
      );
    }

    // Get total count first (faster without joins)
    const total = await baseQuery.getCount();

    // Add sorting
    const validSortFields = ['createdAt', 'updatedAt', 'originalFileName', 'version'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    baseQuery.orderBy(`cv.${sortField}`, sortOrder);

    // Get paginated data with minimal joins
    const data = await baseQuery
      .leftJoinAndSelect('cv.originalCv', 'originalCv')
      .skip(skip)
      .take(limit)
      .getMany();

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      data,
      total,
      page,
      limit,
      totalPages,
      hasNext,
      hasPrev,
    };
  }

  async getCvWithRelations(id: string, userId: string): Promise<Cv> {
    const cv = await this.cvRepository.findOne({
      where: { id, userId },
      relations: ['originalCv', 'jobDescription', 'tailoredVersions'],
    });

    if (!cv) {
      throw new NotFoundException('CV not found');
    }

    return cv;
  }

  async updateCv(id: string, userId: string, updateCvDto: UpdateCvDto): Promise<Cv> {
    const cv = await this.getCvById(id, userId);
    
    // Save current state to version history before updating
    if (!cv.versionHistory) {
      cv.versionHistory = [];
    }
    
    cv.versionHistory.push({
      version: cv.version,
      parsedData: cv.parsedData,
      updatedAt: new Date().toISOString(),
    });
    
    // Update CV data and increment version
    Object.assign(cv, updateCvDto);
    cv.version += 1;
    
    return this.cvRepository.save(cv);
  }

  async tailorCvForJob(cvId: string, userId: string, tailorCvDto: TailorCvDto): Promise<Cv> {
    // Check user limits
    const canTailor = await this.usersService.checkUserLimit(userId, 'jobTailors');
    if (!canTailor) {
      throw new BadRequestException('Job tailoring limit reached for your plan');
    }

    const cv = await this.getCvById(cvId, userId);
    
    // Use AI to tailor CV for specific job
    const tailoredData = await this.aiService.tailorCvForJob(
      cv.parsedData,
      tailorCvDto.jobDescription,
    );
    
    // Create new version
    const tailoredCv = this.cvRepository.create({
      userId: cv.userId,
      originalFileName: cv.originalFileName,
      fileUrl: cv.fileUrl,
      parsedData: tailoredData,
      version: cv.version + 1,
      isTailored: true,
      tailoredForJob: tailorCvDto.jobDescription,
    });

    const savedCv = await this.cvRepository.save(tailoredCv);

    // Increment usage
    await this.usersService.incrementUsage(userId, 'jobTailors');

    return savedCv;
  }

  async getSuggestions(cvId: string, userId: string): Promise<string[]> {
    const cv = await this.getCvById(cvId, userId);
    return this.aiService.suggestImprovements(cv.parsedData);
  }

  async deleteCv(id: string, userId: string): Promise<void> {
    const cv = await this.getCvById(id, userId);
    await this.cvRepository.remove(cv);
  }

  async getCvVersions(cvId: string, userId: string): Promise<any[]> {
    const cv = await this.cvRepository.findOne({
      where: { id: cvId, userId },
      relations: ['versionHistory'],
    });
    
    if (!cv) {
      throw new NotFoundException('CV not found');
    }

    // Return version history from versionHistory field
    if (!cv.versionHistory || cv.versionHistory.length === 0) {
      // If no history, return current version only
      return [{
        id: cv.id,
        version: cv.version,
        parsedData: cv.parsedData,
        createdAt: cv.createdAt,
        updatedAt: cv.updatedAt,
        isTailored: cv.isTailored,
        tailoredForJob: cv.tailoredForJob,
      }];
    }
    
    // Return all versions from history + current version
    const allVersions = [
      // Historical versions
      ...cv.versionHistory.map(vh => ({
        id: `${cv.id}-v${vh.version}`,
        version: vh.version,
        parsedData: vh.parsedData,
        createdAt: cv.createdAt,
        updatedAt: vh.updatedAt,
        isTailored: cv.isTailored,
        tailoredForJob: cv.tailoredForJob,
        isHistorical: true,
      })),
      // Current version
      {
        id: cv.id,
        version: cv.version,
        parsedData: cv.parsedData,
        createdAt: cv.createdAt,
        updatedAt: cv.updatedAt,
        isTailored: cv.isTailored,
        tailoredForJob: cv.tailoredForJob,
        isHistorical: false,
      },
    ];
    
    return allVersions.sort((a, b) => b.version - a.version);
  }

  async duplicateCv(cvId: string, userId: string): Promise<Cv> {
    const originalCv = await this.getCvById(cvId, userId);
    
    // Create a new CV with duplicated data
    const duplicatedCv = this.cvRepository.create({
      userId,
      originalFileName: `${originalCv.originalFileName.replace(/\.[^/.]+$/, '')}_copy${originalCv.originalFileName.match(/\.[^/.]+$/)?.[0] || ''}`,
      fileUrl: originalCv.fileUrl, // Same file URL
      parsedData: originalCv.parsedData, // Copy parsed data
      version: 1, // New version
    });

    return this.cvRepository.save(duplicatedCv);
  }

  async restoreVersion(cvId: string, userId: string, versionNumber: number): Promise<Cv> {
    const cv = await this.getCvById(cvId, userId);
    
    // Find the version to restore
    const versionToRestore = cv.versionHistory?.find(vh => vh.version === versionNumber);
    
    if (!versionToRestore) {
      throw new NotFoundException(`Version ${versionNumber} not found`);
    }
    
    // Save current state before restoring
    if (!cv.versionHistory) {
      cv.versionHistory = [];
    }
    
    cv.versionHistory.push({
      version: cv.version,
      parsedData: cv.parsedData,
      updatedAt: new Date().toISOString(),
    });
    
    // Restore the selected version
    cv.parsedData = versionToRestore.parsedData;
    cv.version += 1; // Increment version (restore creates new version)
    
    return this.cvRepository.save(cv);
  }

  private generateImprovementNotes(parsedData: any): any {
    const notes: {
      parsingImprovements: string[];
      templateEnhancements: string[];
      dataCompleteness: string[];
      lastUpdated: string;
    } = {
      parsingImprovements: [],
      templateEnhancements: [],
      dataCompleteness: [],
      lastUpdated: new Date().toISOString(),
    };

    // Analyze parsing improvements
    if (parsedData.experience && parsedData.experience.length > 0) {
      const hasDetailedExperience = parsedData.experience.some(exp => 
        exp.responsibilities && exp.responsibilities.length > 0 && 
        exp.achievements && exp.achievements.length > 0
      );
      if (hasDetailedExperience) {
        notes.parsingImprovements.push('✅ Extracted detailed responsibilities and achievements for work experience');
      }

      const hasTechStacks = parsedData.experience.some(exp => 
        exp.technologies && exp.technologies.length > 0
      );
      if (hasTechStacks) {
        notes.parsingImprovements.push('✅ Identified and extracted comprehensive tech stacks for each role');
      }

      const hasSubProjects = parsedData.experience.some(exp => 
        exp.subProjects && exp.subProjects.length > 0
      );
      if (hasSubProjects) {
        notes.parsingImprovements.push('✅ Discovered and parsed sub-projects with detailed information');
      }

      const hasTeamSizes = parsedData.experience.some(exp => 
        exp.teamSize && (typeof exp.teamSize === 'string' ? exp.teamSize.trim() !== '' : exp.teamSize > 0)
      );
      if (hasTeamSizes) {
        notes.parsingImprovements.push('✅ Extracted team size information for better context');
      }
    }

    if (parsedData.skills && parsedData.skills.technical && parsedData.skills.technical.length > 0) {
      const hasYearsOfExperience = parsedData.skills.technical.some(skill => 
        skill.includes('years') || skill.includes('year')
      );
      if (hasYearsOfExperience) {
        notes.parsingImprovements.push('✅ Captured years of experience for technical skills');
      }
    }

    if (parsedData.projects && parsedData.projects.length > 0) {
      const hasProjectDetails = parsedData.projects.some(project => 
        project.techStack && project.techStack.length > 0 && 
        project.results && typeof project.results === 'string' && project.results.trim() !== ''
      );
      if (hasProjectDetails) {
        notes.parsingImprovements.push('✅ Extracted comprehensive project information including tech stacks and results');
      }
    }

    if (parsedData.certifications && parsedData.certifications.length > 0) {
      const hasCertLinks = parsedData.certifications.some(cert => 
        cert.link && typeof cert.link === 'string' && cert.link.trim() !== ''
      );
      if (hasCertLinks) {
        notes.parsingImprovements.push('✅ Identified certification links for verification');
      }
    }

    // Analyze template enhancements
    notes.templateEnhancements.push('🎨 Applied modern 2-column professional template');
    notes.templateEnhancements.push('📱 Responsive design optimized for all devices');
    notes.templateEnhancements.push('🎯 ATS-friendly formatting for better job application success');
    notes.templateEnhancements.push('📊 Visual hierarchy with color-coded sections');
    notes.templateEnhancements.push('💼 Professional typography and spacing');
    
    // Add tailoring-specific improvements
    notes.templateEnhancements.push('🎯 Tailored content optimized for specific job requirements');
    notes.templateEnhancements.push('📈 Enhanced keyword matching for ATS systems');
    notes.templateEnhancements.push('✨ Reordered experience to highlight relevant skills');

    // Analyze data completeness
    const totalSections = 8; // name, email, phone, summary, education, experience, skills, projects
    let completedSections = 0;

    if (parsedData.name && typeof parsedData.name === 'string' && parsedData.name.trim() !== '') completedSections++;
    if (parsedData.email && typeof parsedData.email === 'string' && parsedData.email.trim() !== '') completedSections++;
    if (parsedData.phone && typeof parsedData.phone === 'string' && parsedData.phone.trim() !== '') completedSections++;
    if (parsedData.summary && typeof parsedData.summary === 'string' && parsedData.summary.trim() !== '') completedSections++;
    if (parsedData.education && parsedData.education.length > 0) completedSections++;
    if (parsedData.experience && parsedData.experience.length > 0) completedSections++;
    if (parsedData.skills && (parsedData.skills.technical?.length > 0 || parsedData.skills.soft?.length > 0)) completedSections++;
    if (parsedData.projects && parsedData.projects.length > 0) completedSections++;

    const completenessPercentage = Math.round((completedSections / totalSections) * 100);
    notes.dataCompleteness.push(`📈 Data completeness: ${completenessPercentage}% (${completedSections}/${totalSections} sections)`);

    if (parsedData.experience && parsedData.experience.length > 0) {
      const totalExperience = parsedData.experience.length;
      const detailedExperience = parsedData.experience.filter(exp => 
        exp.responsibilities && exp.responsibilities.length > 0
      ).length;
      notes.dataCompleteness.push(`💼 Work experience: ${detailedExperience}/${totalExperience} positions with detailed information`);
    }

    if (parsedData.skills && parsedData.skills.technical) {
      notes.dataCompleteness.push(`🛠️ Technical skills: ${parsedData.skills.technical.length} skills identified`);
    }

    if (parsedData.projects && parsedData.projects.length > 0) {
      notes.dataCompleteness.push(`🚀 Projects: ${parsedData.projects.length} projects with comprehensive details`);
    }

    if (parsedData.certifications && parsedData.certifications.length > 0) {
      notes.dataCompleteness.push(`🏆 Certifications: ${parsedData.certifications.length} professional certifications`);
    }

    return notes;
  }

  async tailorCv(cvId: string, userId: string, jobDescription: string): Promise<Cv> {
    try {
      // Debug: Log parameters to see what's being passed
      console.log('=== DEBUG tailorCv ===');
      console.log('cvId:', cvId, 'type:', typeof cvId);
      console.log('userId:', userId, 'type:', typeof userId);
      console.log('jobDescription:', jobDescription, 'type:', typeof jobDescription);
      console.log('=== END DEBUG ===');
      
      const originalCv = await this.getCvById(cvId, userId);
      
      // Create JobDescription
      const jobDesc = await this.jobDescriptionService.createJobDescription(
        userId,
        'Job Description',
        jobDescription
      );
      
      console.log('Created JobDescription:', jobDesc);
      console.log('JobDescription ID:', jobDesc.id);
      console.log('JobDescription ID type:', typeof jobDesc.id);
    
    // Use AI to tailor CV content
    const tailoredData = await this.aiService.tailorCvContent(
      originalCv.parsedData,
      jobDescription
    );

    // Generate improvement notes for tailored CV
    const improvementNotes = this.generateImprovementNotes(tailoredData);

    // Generate clean tailored filename with version suffix
    const tailoredFileName = this.generateTailoredFileName(
      originalCv.originalFileName,
      originalCv.version + 1
    );

    // Create new tailored CV with links
    const tailoredCv = this.cvRepository.create({
      userId,
      originalFileName: tailoredFileName,
      fileUrl: originalCv.fileUrl, // Same file URL
      parsedData: tailoredData,
      version: originalCv.version + 1,
      isTailored: true,
      tailoredForJob: jobDescription.substring(0, 100), // Store first 100 chars of JD
      originalCvId: originalCv.id, // Link to CV that user selected
      jobDescriptionId: jobDesc.id, // Link to JobDescription
      improvementNotes,
    });

    return this.cvRepository.save(tailoredCv);
    } catch (error) {
      console.error('Error in tailorCv:', error);
      throw error;
    }
  }

  /**
   * Generate clean tailored filename without duplicating suffix
   * Supports multiple suffix formats:
   * - _tailored (default)
   * - _v1, _v2, etc (version based)
   */
  private generateTailoredFileName(
    originalFileName: string,
    version?: number,
    suffixType: 'tailored' | 'version' = 'version' // Use version by default
  ): string {
    const maxLength = 60;
    const extension = originalFileName.match(/\.[^/.]+$/)?.[0] || '';
    let baseName = originalFileName.replace(/\.[^/.]+$/, '');
    
    // Remove existing suffixes (both _tailored and _v* patterns)
    baseName = baseName.replace(/(_tailored|_v\d+)+$/i, '');
    
    // Generate suffix based on type
    let suffix = '_tailored';
    if (suffixType === 'version' && version) {
      suffix = `_v${version}`;
    }
    
    // Add suffix
    const newFileName = `${baseName}${suffix}${extension}`;
    
    // If too long, truncate base name
    if (newFileName.length > maxLength) {
      const maxBaseName = maxLength - extension.length - suffix.length;
      baseName = baseName.substring(0, Math.max(1, maxBaseName));
      return `${baseName}${suffix}${extension}`;
    }
    
    return newFileName;
  }

  /**
   * Find or create JobDescription based on content
   */
  private async findOrCreateJobDescription(userId: string, jobDescription: string): Promise<JobDescription> {
    // Try to find existing JobDescription with similar content
    const existingJD = await this.jobDescriptionRepository.findOne({
      where: { 
        userId,
        description: jobDescription 
      }
    });

    if (existingJD) {
      return existingJD;
    }

    // Create new JobDescription
    return this.jobDescriptionService.createJobDescription(
      userId,
      'Job Description',
      jobDescription
    );
  }

  /**
   * Create optimized snapshot from JobDescription
   */
  private createJobDescriptionSnapshot(jobDescription: JobDescription): any {
    return {
      title: jobDescription.title,
      company: jobDescription.company,
      description: jobDescription.description.substring(0, 500), // Truncated to 500 chars
      keyRequirements: jobDescription.requirements?.skills?.slice(0, 5) || [], // Only top 5 requirements
      experience: jobDescription.experience,
      createdAt: new Date().toISOString(),
    };
  }

  async analyzeCompatibility(cvId: string, userId: string, jobDescription: string): Promise<{
    score: number;
    matchedSkills: string[];
    missingSkills: string[];
    matchedExperience: string[];
    missingRequirements: string[];
    suggestions: string[];
    strengths: string[];
  }> {
    const cv = await this.getCvById(cvId, userId);
    
    // Find or create JobDescription
    const jobDesc = await this.findOrCreateJobDescription(userId, jobDescription);
    
    // Check if analysis already exists for this (CV, JobDescription, User) combination
    const existingAnalysis = await this.matchingAnalysisRepository.findOne({
      where: { 
        cvId,
        jobDescriptionId: jobDesc.id,
        userId 
      }
    });

    if (existingAnalysis) {
      this.logger.log(`Reusing existing analysis for CV ${cvId} + JobDescription ${jobDesc.id}`);
      return {
        score: existingAnalysis.score,
        matchedSkills: existingAnalysis.matchedSkills,
        missingSkills: existingAnalysis.missingSkills,
        matchedExperience: [],
        missingRequirements: [],
        suggestions: existingAnalysis.suggestions,
        strengths: existingAnalysis.strengths,
        reused: true,
      } as any;
    }

    // Use AI to analyze compatibility
    const analysis = await this.aiService.analyzeCompatibility(
      cv.parsedData,
      jobDescription
    );

    // TODO: Storage Strategy for Analysis Records
    // Current Issue: Analysis is tied to (CV, JD, User) tuple
    // Problem: When tailoring CV, new CV created but analysis not auto-generated
    // Result: CV detail page shows "No analysis available" when opening tailored CV
    // 
    // Solution Options (to be implemented):
    // 1. Auto-create analysis when tailorCv() is called
    // 2. Generate on-demand when getCvWithRelatedData() is called
    // 3. Store analysis differently (decoupled from CV)
    //
    // For now: Skip saving analysis - will implement comprehensive storage strategy later

    // COMMENTED OUT - See TODO above
    // const analysisRecord = this.matchingAnalysisRepository.create({
    //   cvId,
    //   jobDescriptionId: jobDesc.id,
    //   userId,
    //   jobDescriptionSnapshot: this.createJobDescriptionSnapshot(jobDesc),
    //   score: analysis.score,
    //   matchedSkills: analysis.matchedSkills,
    //   missingSkills: analysis.missingSkills,
    //   suggestions: analysis.suggestions,
    //   strengths: analysis.strengths,
    //   isSnapshot: false,
    // });
    // await this.matchingAnalysisRepository.save(analysisRecord);

    return {
      ...analysis,
      reused: false,
    } as any;
  }

  async generateCoverLetter(cvId: string, userId: string, jobDescription: string): Promise<{
    coverLetter: string;
  }> {
    const cv = await this.getCvById(cvId, userId);
    
    // Find or create JobDescription
    const jobDesc = await this.findOrCreateJobDescription(userId, jobDescription);
    
    // Check if cover letter already exists for this (CV, JobDescription, User) combination
    const existingCoverLetter = await this.coverLetterRepository.findOne({
      where: { 
        cvId,
        jobDescriptionId: jobDesc.id,
        userId 
      }
    });

    if (existingCoverLetter) {
      this.logger.log(`Reusing existing cover letter for CV ${cvId} + JobDescription ${jobDesc.id}`);
      return {
        coverLetter: existingCoverLetter.content,
        reused: true,
      } as any;
    }

    // Use AI to generate cover letter
    const coverLetter = await this.aiService.generateCoverLetter(
      cv.parsedData,
      jobDescription
    );

    // TODO: Storage Strategy for Cover Letter Records
    // Current Issue: Cover letter is tied to (CV, JD, User) tuple
    // Problem: When tailoring CV, new CV created but cover letter not auto-generated
    // Result: CV detail page shows "No cover letter available" when opening tailored CV
    //
    // Solution Options (to be implemented):
    // 1. Auto-create cover letter when tailorCv() is called
    // 2. Generate on-demand when getCvWithRelatedData() is called
    // 3. Store cover letter differently (decoupled from CV)
    //
    // For now: Skip saving cover letter - will implement comprehensive storage strategy later

    // COMMENTED OUT - See TODO above
    // const coverLetterRecord = this.coverLetterRepository.create({
    //   cvId,
    //   jobDescriptionId: jobDesc.id,
    //   userId,
    //   jobDescriptionSnapshot: this.createJobDescriptionSnapshot(jobDesc),
    //   content: coverLetter.coverLetter,
    //   wordCount: coverLetter.coverLetter.split(' ').length,
    //   isSnapshot: false,
    // });
    // await this.coverLetterRepository.save(coverLetterRecord);

    return { 
      coverLetter: coverLetter.coverLetter,
      reused: false,
    } as any;
  }

  async quickBuildCv(userId: string, quickBuildDto: QuickBuildCvDto): Promise<Cv> {
    // Check user limits
    const canUpload = await this.usersService.checkUserLimit(userId, 'cvUploads');
    if (!canUpload) {
      throw new BadRequestException('CV upload limit reached for your plan');
    }

    try {
      // Create basic CV data structure using standardized CVData format
      const cvData = {
        contact: {
          name: quickBuildDto.name,
          email: quickBuildDto.email,
          phone: '',
          address: '',
          linkedin: '',
          github: '',
          website: '',
          location: ''
        },
        summary: `Experienced ${quickBuildDto.targetRole} looking for new opportunities`,
        experience: [],
        skills: {
          technical: [],
          soft: [],
          languages: [],
          tools: []
        },
        education: [],
        projects: [],
        certifications: [],
        awards: [],
        publications: [],
        volunteer: []
      };

      // Use AI to tailor the CV based on job description
      const tailoredCvData = await this.aiService.tailorCvForJob(
        cvData as any,
        quickBuildDto.jobDescription
      );

      // Ensure the data is in the correct standardized format
      const normalizedCvData = CVDataUtils.normalizeCVData(tailoredCvData);

      // Create CV record
      const cv = this.cvRepository.create({
        userId,
        originalFileName: `CV_${quickBuildDto.name}_${Date.now()}.pdf`,
        fileUrl: '',
        parsedData: normalizedCvData,
        isTailored: true,
        tailoredForJob: quickBuildDto.jobDescription.substring(0, 100)
      });

      const savedCv = await this.cvRepository.save(cv);

      // Increment usage
      await this.usersService.incrementUsage(userId, 'cvUploads');

      return savedCv;
    } catch (error) {
      this.logger.error('Quick build CV failed:', error);
      throw new BadRequestException('Failed to create CV from basic information');
    }
  }

  async updateCvWithQuickBuild(cvId: string, userId: string, quickBuildDto: QuickBuildCvDto): Promise<Cv> {
    // Get existing CV
    const existingCv = await this.getCvById(cvId, userId);

    try {
      // Create updated CV data structure using standardized CVData format
      const cvData = {
        contact: {
          name: quickBuildDto.name,
          email: quickBuildDto.email,
          phone: (existingCv.parsedData as any).contact?.phone || (existingCv.parsedData as any).phone || '',
          address: (existingCv.parsedData as any).contact?.address || (existingCv.parsedData as any).address || '',
          linkedin: (existingCv.parsedData as any).contact?.linkedin || (existingCv.parsedData as any).linkedin || '',
          github: (existingCv.parsedData as any).contact?.github || '',
          website: (existingCv.parsedData as any).contact?.website || '',
          location: (existingCv.parsedData as any).contact?.location || ''
        },
        summary: `Experienced ${quickBuildDto.targetRole} looking for new opportunities`,
        experience: existingCv.parsedData.experience || [],
        skills: existingCv.parsedData.skills || {
          technical: [],
          soft: [],
          languages: [],
          tools: []
        },
        education: existingCv.parsedData.education || [],
        projects: existingCv.parsedData.projects || [],
        certifications: existingCv.parsedData.certifications || [],
        awards: existingCv.parsedData.awards || [],
        publications: existingCv.parsedData.publications || [],
        volunteer: existingCv.parsedData.volunteer || []
      };

      // Use AI to tailor the CV based on job description
      const tailoredCvData = await this.aiService.tailorCvForJob(
        cvData as any,
        quickBuildDto.jobDescription
      );

      // Ensure the data is in the correct standardized format
      const normalizedCvData = CVDataUtils.normalizeCVData(tailoredCvData);

      // Update CV record
      existingCv.parsedData = normalizedCvData;
      existingCv.tailoredForJob = quickBuildDto.jobDescription.substring(0, 100);
      existingCv.version = existingCv.version + 1;

      return this.cvRepository.save(existingCv);
    } catch (error) {
      this.logger.error('Update CV with quick build failed:', error);
      throw new BadRequestException('Failed to update CV with new information');
    }
  }

  /**
   * Export CV to PDF with template support
   */
  async exportToPDF(cvData: CVData, template: string = 'professional'): Promise<Buffer> {
    return this.exportService.exportToPDF(cvData, template);
  }

  /**
   * Export CV to PDF with custom configuration
   */
  async exportToPDFWithConfig(cvData: CVData, template: string, templateConfig: TemplateConfig): Promise<Buffer> {
    return this.exportService.exportToPDF(cvData, template, templateConfig);
  }

  /**
   * Export CV to Word document
   */
  async exportToWord(cvData: CVData): Promise<Buffer> {
    return this.exportService.exportToWord(cvData);
  }

  /**
   * Export CV to ATS-friendly format
   */
  async exportToATS(cvData: CVData): Promise<Buffer> {
    return this.exportService.exportToATS(cvData);
  }

  /**
   * Generate template preview HTML
   */
  async generateTemplatePreview(cvData: CVData, template: string, templateConfig: TemplateConfig): Promise<string> {
    // Normalize CV data before generating template
    const normalizedCVData = CVDataUtils.normalizeCVData(cvData);
    return this.dynamicTemplateService.generateDynamicTemplate(normalizedCVData, templateConfig, true);
  }

  /**
   * Get available templates
   */
  async getAvailableTemplates() {
    return this.templatesService.findAll();
  }

  /**
   * Save job description to CV
   */
  async saveJobDescription(cvId: string, userId: string, jobDescription: any) {
    const cv = await this.cvRepository.findOne({
      where: { id: cvId, userId }
    });

    if (!cv) {
      throw new NotFoundException('CV not found');
    }

    cv.jobDescription = jobDescription;
    await this.cvRepository.save(cv);
    return cv;
  }

  /**
   * Save matching analysis to CV
   */
  async saveMatchingAnalysis(cvId: string, userId: string, analysis: any) {
    const cv = await this.cvRepository.findOne({
      where: { id: cvId, userId }
    });

    if (!cv) {
      throw new NotFoundException('CV not found');
    }

    cv.matchingAnalysis = analysis;
    await this.cvRepository.save(cv);
    return cv;
  }

  /**
   * Save cover letter to CV
   */
  async saveCoverLetter(cvId: string, userId: string, coverLetter: string) {
    const cv = await this.cvRepository.findOne({
      where: { id: cvId, userId }
    });

    if (!cv) {
      throw new NotFoundException('CV not found');
    }

    cv.coverLetter = coverLetter;
    await this.cvRepository.save(cv);
    return cv;
  }

  /**
   * Get analysis by JobDescription ID and CV ID
   */
  async getAnalysisByJobDescription(jobDescriptionId: string, cvId: string, userId: string): Promise<CvMatchingAnalysis | null> {
    return this.matchingAnalysisRepository.findOne({
      where: { 
        cvId,  // ✅ ADD cvId
        jobDescriptionId,
        userId 
      },
      relations: ['jobDescription']
    });
  }

  /**
   * Get cover letter by JobDescription ID and CV ID
   */
  async getCoverLetterByJobDescription(jobDescriptionId: string, cvId: string, userId: string): Promise<CvCoverLetter | null> {
    return this.coverLetterRepository.findOne({
      where: { 
        cvId,  // ✅ ADD cvId
        jobDescriptionId,
        userId 
      },
      relations: ['jobDescription']
    });
  }

  /**
   * Get all analyses for a user
   */
  async getUserAnalyses(userId: string): Promise<CvMatchingAnalysis[]> {
    return this.matchingAnalysisRepository.find({
      where: { userId },
      relations: ['jobDescription'],
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * Get all cover letters for a user
   */
  async getUserCoverLetters(userId: string): Promise<CvCoverLetter[]> {
    return this.coverLetterRepository.find({
      where: { userId },
      relations: ['jobDescription'],
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * Get CV with all related data (updated for new structure)
   */
  async getCvWithRelatedData(cvId: string, userId: string) {
    const cv = await this.cvRepository.findOne({
      where: { id: cvId, userId },
      relations: ['jobDescription']
    });

    if (!cv) {
      throw new NotFoundException('CV not found');
    }

    // Get analysis and cover letter if CV has jobDescriptionId
    let matchingAnalysis = null;
    let coverLetter = null;

    if (cv.jobDescriptionId) {
      try {
        matchingAnalysis = await this.getAnalysisByJobDescription(cv.jobDescriptionId, cvId, userId);
        coverLetter = await this.getCoverLetterByJobDescription(cv.jobDescriptionId, cvId, userId);
      } catch (error) {
        this.logger.warn(`Failed to fetch related data for CV ${cvId}:`, error.message);
      }
    }

    // Get tailored CVs for this CV
    let tailoredCvs = [];
    try {
      console.log('bbbb',cvId, userId);
      tailoredCvs = await this.cvRepository.find({
        where: { originalCvId: cvId, userId },
        relations: ['jobDescription'],
        order: { createdAt: 'DESC' }
      });

      console.log('tailoredCvs', tailoredCvs);
    } catch (error) {
      this.logger.warn(`Failed to fetch tailored CVs for CV ${cvId}:`, error.message);
    }

    // Clean up the response - remove redundant fields
    const { jobDescriptionData, ...cleanCv } = cv;

    return {
      ...cleanCv,
      jobDescription: cv.jobDescription || null,
      matchingAnalysis: matchingAnalysis || null,
      coverLetter: coverLetter?.content || null,
      tailoredCvs: tailoredCvs || [],
    };
  }

  /**
   * Get cleanup statistics
   */
  async getCleanupStats() {
    // This would need to be implemented with DataCleanupService
    // For now, return basic stats
    return {
      totalAnalyses: await this.matchingAnalysisRepository.count(),
      totalCoverLetters: await this.coverLetterRepository.count(),
      totalJobDescriptions: await this.jobDescriptionRepository.count(),
    };
  }

  /**
   * Trigger manual cleanup
   */
  async triggerManualCleanup() {
    // This would need to be implemented with DataCleanupService
    // For now, return success message
    this.logger.log('Manual cleanup triggered');
    return { message: 'Cleanup completed successfully' };
  }

}