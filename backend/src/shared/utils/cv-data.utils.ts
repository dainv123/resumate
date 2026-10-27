import {
  CVData,
  ContactInfo,
  Experience,
  Education,
  Project,
  Skills,
  TemplateConfig,
} from '../interfaces/cv-data.interface';

/**
 * CV Data Utility Functions
 * Provides validation, transformation, and normalization functions for CV data
 */

export class CVDataUtils {
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

      contact: this.normalizeContactInfo(
        data.contact || {
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          linkedin: data.linkedin || '',
          github: data.github || '',
          website: data.website || '',
          location: data.location || '',
        },
      ),
      summary: data.summary || '',

      experience: this.normalizeExperience(data.experience || []),
      education: this.normalizeEducation(data.education || []),
      skills: this.normalizeSkills(data.skills || {}),
      projects: this.normalizeProjects(data.projects || []),

      certifications: data.certifications
        ? this.normalizeCertifications(data.certifications)
        : [],
      awards: data.awards ? this.normalizeAwards(data.awards) : [],
      publications: data.publications
        ? this.normalizePublications(data.publications)
        : [],
      volunteer: data.volunteer ? this.normalizeVolunteer(data.volunteer) : [],
      languages: data.languages ? this.normalizeLanguages(data.languages) : [],

      template: data.template || this.getDefaultTemplateConfig(),
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
      location: contact.location || '',
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
      companyDescription: exp.companyDescription || '',
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
      location: edu.location || '',
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
      duration: project.duration || '',
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
      soft: skills.soft || [],
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
      description: cert.description || '',
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
      category: award.category || '',
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
      description: pub.description || '',
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
      location: vol.location || '',
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
      certifications: lang.certifications || [],
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
        languages: true,
      },
      styling: {
        primaryColor: '#2c3e50',
        secondaryColor: '#34495e',
        fontFamily: 'Arial, sans-serif',
        fontSize: 'medium',
      },
    };
  }

  /**
   * Validate CV data structure
   */
  static validateCVData(data: CVData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Required fields validation
    if (!data.contact?.name) errors.push('Contact name is required');
    if (!data.contact?.email) errors.push('Contact email is required');
    if (!data.summary) errors.push('Summary is required');

    // Array validations
    if (!Array.isArray(data.experience))
      errors.push('Experience must be an array');
    if (!Array.isArray(data.education))
      errors.push('Education must be an array');
    if (!Array.isArray(data.projects)) errors.push('Projects must be an array');
    if (!data.skills) errors.push('Skills object is required');

    // Skills validation
    if (data.skills && !Array.isArray(data.skills.technical)) {
      errors.push('Technical skills must be an array');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Merge CV data with updates
   */
  static mergeCVData(existing: CVData, updates: Partial<CVData>): CVData {
    return {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      contact: { ...existing.contact, ...updates.contact },
      skills: { ...existing.skills, ...updates.skills },
      template: { ...existing.template, ...updates.template } as TemplateConfig,
    };
  }

  /**
   * Convert legacy CV data to new structure
   */
  static convertLegacyData(legacyData: any): CVData {
    return this.normalizeCVData({
      contact: {
        name: legacyData.name,
        email: legacyData.email,
        phone: legacyData.phone,
        address: legacyData.address,
        linkedin: legacyData.linkedin,
      },
      summary: legacyData.summary,
      experience: legacyData.experience,
      education: legacyData.education,
      skills: legacyData.skills,
      projects: legacyData.projects,
      certifications: legacyData.certifications,
      awards: legacyData.awards,
      publications: legacyData.publications,
      volunteer: legacyData.volunteer,
    });
  }

  /**
   * Get CV data statistics
   */
  static getCVStats(data: CVData): any {
    const filledSections = this.countNonEmptySections(data);
    const totalSections = 8; // Total possible sections
    const completionRate = Math.round((filledSections / totalSections) * 100);

    return {
      totalSections: totalSections,
      filledSections: filledSections,
      completionRate: completionRate,
      experienceCount: data.experience?.length || 0,
      educationCount: data.education?.length || 0,
      projectCount: data.projects?.length || 0,
      skillCount: this.getTotalSkillCount(data.skills),
      skillsCategories: Object.keys(data.skills || {}),
      certificationCount: data.certifications?.length || 0,
      awardCount: data.awards?.length || 0,
      publicationCount: data.publications?.length || 0,
      volunteerCount: data.volunteer?.length || 0,
      completenessScore: this.calculateCompleteness(data),
    };
  }

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
    return (
      (skills.technical?.length || 0) +
      (skills.tools?.length || 0) +
      (skills.languages?.length || 0) +
      (skills.soft?.length || 0)
    );
  }

  private static calculateCompleteness(data: CVData): number {
    const totalPossible = 10; // Total number of sections
    const filledSections = this.countNonEmptySections(data);
    return Math.round((filledSections / totalPossible) * 100);
  }
}
