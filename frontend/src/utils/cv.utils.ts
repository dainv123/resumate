/**
 * Frontend CV Utility Functions
 * Provides validation, transformation, and helper functions for CV data
 */

import { 
  CVData, 
  ContactInfo, 
  Experience, 
  Education, 
  Project, 
  Skills, 
  TemplateConfig,
  CVStats,
  CVValidationResult,
  CVFormState
} from '../types/cv.types';

export class CVUtils {
  /**
   * Normalize and validate CV data structure
   */
  static normalizeCVData(data: any): CVData {
    return {
      id: data.id || undefined,
      version: data.version || '1.0',
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt || new Date().toISOString(),
      lastModified: data.lastModified || new Date().toISOString(),
      
      contact: this.normalizeContactInfo(data.contact || {}),
      summary: data.summary || '',
      
      experience: this.normalizeExperience(data.experience || []),
      education: this.normalizeEducation(data.education || []),
      skills: this.normalizeSkills(data.skills || {}),
      projects: this.normalizeProjects(data.projects || []),
      
      certifications: data.certifications ? this.normalizeCertifications(data.certifications) : [],
      awards: data.awards ? this.normalizeAwards(data.awards) : [],
      publications: data.publications ? this.normalizePublications(data.publications) : [],
      volunteer: data.volunteer ? this.normalizeVolunteer(data.volunteer) : [],
      languages: data.languages ? this.normalizeLanguages(data.languages) : [],
      
      template: data.template || this.getDefaultTemplateConfig()
    };
  }

  /**
   * Normalize contact information
   */
  static normalizeContactInfo(contact: any): ContactInfo {
    return {
      name: contact.name || '',
      email: contact.email || '',
      phone: contact.phone || '',
      address: contact.address || '',
      linkedin: contact.linkedin || '',
      github: contact.github || '',
      website: contact.website || '',
      location: contact.location || ''
    };
  }

  /**
   * Normalize experience array
   */
  static normalizeExperience(experience: any[]): Experience[] {
    return experience.map((exp, index) => ({
      id: exp.id || `exp_${index}`,
      title: exp.title || '',
      company: exp.company || '',
      location: exp.location || '',
      startDate: exp.startDate || exp.dates || '',
      endDate: exp.endDate || (exp.current ? '' : ''),
      current: exp.current || false,
      description: exp.description || '',
      responsibilities: exp.responsibilities || [],
      achievements: exp.achievements || [],
      technologies: exp.technologies || [],
      teamSize: exp.teamSize || undefined,
      companyDescription: exp.companyDescription || ''
    }));
  }

  /**
   * Normalize education array
   */
  static normalizeEducation(education: any[]): Education[] {
    return education.map((edu, index) => ({
      id: edu.id || `edu_${index}`,
      institution: edu.institution || edu.school || '',
      degree: edu.degree || '',
      field: edu.field || '',
      startDate: edu.startDate || edu.dates || '',
      endDate: edu.endDate || '',
      gpa: edu.gpa || '',
      description: edu.description || '',
      location: edu.location || ''
    }));
  }

  /**
   * Normalize projects array
   */
  static normalizeProjects(projects: any[]): Project[] {
    return projects.map((project, index) => ({
      id: project.id || `project_${index}`,
      name: project.name || '',
      description: project.description || '',
      startDate: project.startDate || '',
      endDate: project.endDate || '',
      technologies: project.technologies || [],
      role: project.role || '',
      teamSize: project.teamSize || undefined,
      results: project.results || [],
      link: project.link || '',
      repository: project.repository || '',
      duration: project.duration || ''
    }));
  }

  /**
   * Normalize skills object
   */
  static normalizeSkills(skills: any): Skills {
    return {
      technical: skills.technical || [],
      tools: skills.tools || [],
      languages: skills.languages || [],
      soft: skills.soft || []
    };
  }

  /**
   * Normalize certifications array
   */
  static normalizeCertifications(certifications: any[]): any[] {
    return certifications.map((cert, index) => ({
      id: cert.id || `cert_${index}`,
      name: cert.name || '',
      issuer: cert.issuer || '',
      date: cert.date || '',
      expirationDate: cert.expirationDate || '',
      credentialId: cert.credentialId || '',
      credentialUrl: cert.credentialUrl || '',
      description: cert.description || ''
    }));
  }

  /**
   * Normalize awards array
   */
  static normalizeAwards(awards: any[]): any[] {
    return awards.map((award, index) => ({
      id: award.id || `award_${index}`,
      title: award.title || award.name || '',
      issuer: award.issuer || '',
      date: award.date || '',
      description: award.description || '',
      category: award.category || ''
    }));
  }

  /**
   * Normalize publications array
   */
  static normalizePublications(publications: any[]): any[] {
    return publications.map((pub, index) => ({
      id: pub.id || `pub_${index}`,
      title: pub.title || '',
      authors: pub.authors || [],
      publicationDate: pub.publicationDate || pub.date || '',
      journal: pub.journal || '',
      conference: pub.conference || '',
      doi: pub.doi || '',
      url: pub.url || '',
      description: pub.description || ''
    }));
  }

  /**
   * Normalize volunteer array
   */
  static normalizeVolunteer(volunteer: any[]): any[] {
    return volunteer.map((vol, index) => ({
      id: vol.id || `vol_${index}`,
      organization: vol.organization || '',
      role: vol.role || '',
      startDate: vol.startDate || vol.dates || '',
      endDate: vol.endDate || '',
      current: vol.current || false,
      description: vol.description || '',
      responsibilities: vol.responsibilities || [],
      achievements: vol.achievements || [],
      location: vol.location || ''
    }));
  }

  /**
   * Normalize languages array
   */
  static normalizeLanguages(languages: any[]): any[] {
    return languages.map((lang, index) => ({
      id: lang.id || `lang_${index}`,
      name: lang.name || '',
      proficiency: lang.proficiency || 'Intermediate',
      certifications: lang.certifications || []
    }));
  }

  /**
   * Get default template configuration
   */
  static getDefaultTemplateConfig(): TemplateConfig {
    return {
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
    };
  }

  /**
   * Validate CV data structure
   */
  static validateCVData(data: CVData): CVValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Required fields validation
    if (!data.contact?.name) errors.push('Contact name is required');
    if (!data.contact?.email) errors.push('Contact email is required');
    if (!data.summary) errors.push('Summary is required');

    // Email validation
    if (data.contact?.email && !this.isValidEmail(data.contact.email)) {
      errors.push('Invalid email format');
    }

    // Array validations
    if (!Array.isArray(data.experience)) errors.push('Experience must be an array');
    if (!Array.isArray(data.education)) errors.push('Education must be an array');
    if (!Array.isArray(data.projects)) errors.push('Projects must be an array');
    if (!data.skills) errors.push('Skills object is required');

    // Skills validation
    if (data.skills && !Array.isArray(data.skills.technical)) {
      errors.push('Technical skills must be an array');
    }

    // Warnings
    if (!data.contact?.phone) warnings.push('Phone number is recommended');
    if (!data.contact?.linkedin) warnings.push('LinkedIn profile is recommended');
    if (data.experience?.length === 0) warnings.push('No work experience added');
    if (data.education?.length === 0) warnings.push('No education added');
    if (data.projects?.length === 0) warnings.push('No projects added');

    // Suggestions
    if (data.summary && data.summary.length < 100) {
      suggestions.push('Consider expanding your summary to at least 100 characters');
    }
    if (data.experience?.length > 0 && !data.experience.some(exp => exp.achievements?.length > 0)) {
      suggestions.push('Add achievements to your work experience');
    }
    if (data.projects?.length > 0 && !data.projects.some(proj => proj.link)) {
      suggestions.push('Add links to your projects for better visibility');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  /**
   * Get CV data statistics
   */
  static getCVStats(data: CVData): CVStats {
    return {
      totalSections: this.countNonEmptySections(data),
      experienceCount: data.experience?.length || 0,
      educationCount: data.education?.length || 0,
      projectCount: data.projects?.length || 0,
      skillCount: this.getTotalSkillCount(data.skills),
      certificationCount: data.certifications?.length || 0,
      awardCount: data.awards?.length || 0,
      publicationCount: data.publications?.length || 0,
      volunteerCount: data.volunteer?.length || 0,
      completenessScore: this.calculateCompleteness(data)
    };
  }

  /**
   * Create empty CV data structure
   */
  static createEmptyCV(): CVData {
    return {
      contact: {
        name: '',
        email: '',
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
      projects: [],
      certifications: [],
      awards: [],
      publications: [],
      volunteer: [],
      languages: [],
      template: this.getDefaultTemplateConfig()
    };
  }

  /**
   * Generate unique IDs for CV sections
   */
  static generateSectionId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Check if CV data has changes
   */
  static hasChanges(original: CVData, current: CVData): boolean {
    return JSON.stringify(original) !== JSON.stringify(current);
  }

  /**
   * Format date for display
   */
  static formatDate(date: string): string {
    if (!date) return '';
    try {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long'
      });
    } catch {
      return date;
    }
  }

  /**
   * Format date range
   */
  static formatDateRange(startDate: string, endDate?: string, current?: boolean): string {
    const start = this.formatDate(startDate);
    if (current || !endDate) {
      return `${start} - Present`;
    }
    const end = this.formatDate(endDate);
    return `${start} - ${end}`;
  }

  // Private helper methods
  private static countNonEmptySections(data: CVData): number {
    let count = 0;
    if (data.contact?.name) count++;
    if (data.summary) count++;
    if (data.experience?.length > 0) count++;
    if (data.education?.length > 0) count++;
    if (this.getTotalSkillCount(data.skills) > 0) count++;
    if (data.projects?.length > 0) count++;
     if (data.certifications && data.certifications.length > 0) count++;
     if (data.awards && data.awards.length > 0) count++;
     if (data.publications && data.publications.length > 0) count++;
     if (data.volunteer && data.volunteer.length > 0) count++;
    return count;
  }

  private static getTotalSkillCount(skills: Skills): number {
    return (skills.technical?.length || 0) + 
           (skills.tools?.length || 0) + 
           (skills.languages?.length || 0) + 
           (skills.soft?.length || 0);
  }

  private static calculateCompleteness(data: CVData): number {
    const totalPossible = 10; // Total number of sections
    const filledSections = this.countNonEmptySections(data);
    return Math.round((filledSections / totalPossible) * 100);
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
