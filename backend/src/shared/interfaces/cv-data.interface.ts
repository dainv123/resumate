/**
 * Standardized CV Data Structure
 * This interface defines the canonical structure for CV data across the entire application
 * Used by: Frontend, Backend, Templates, AI Services, Export Services
 */

// Contact Information
export interface ContactInfo {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  location?: string;
}

// Skills Structure
export interface Skills {
  technical: string[];
  tools: string[];
  languages: string[];
  soft: string[];
}

// Education
export interface Education {
  id?: string;
  institution: string;
  degree: string;
  field?: string;
  startDate: string;
  endDate?: string;
  gpa?: string;
  description?: string;
  location?: string;
}

// Work Experience
export interface Experience {
  id?: string;
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description?: string;
  responsibilities: string[];
  achievements: string[];
  technologies: string[];
  teamSize?: number;
  companyDescription?: string;
}

// Projects
export interface Project {
  id?: string;
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  technologies: string[];
  role?: string;
  teamSize?: number;
  results?: string[];
  link?: string;
  repository?: string;
  duration?: string;
}

// Certifications
export interface Certification {
  id?: string;
  name: string;
  issuer: string;
  date: string;
  expirationDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  description?: string;
}

// Awards & Recognition
export interface Award {
  id?: string;
  title: string;
  issuer: string;
  date: string;
  description?: string;
  category?: string;
}

// Publications
export interface Publication {
  id?: string;
  title: string;
  authors: string[];
  publicationDate: string;
  journal?: string;
  conference?: string;
  doi?: string;
  url?: string;
  description?: string;
}

// Volunteer Experience
export interface Volunteer {
  id?: string;
  organization: string;
  role: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description?: string;
  responsibilities: string[];
  achievements: string[];
  location?: string;
}

// Language Proficiency
export interface Language {
  name: string;
  proficiency: 'Native' | 'Fluent' | 'Advanced' | 'Intermediate' | 'Basic';
  certifications?: string[];
}

// Custom Sections (for extensibility)
export interface CustomSection {
  id: string;
  title: string;
  content: any;
  order: number;
}

// Main CV Data Structure
export interface CVData {
  // Metadata
  id?: string;
  version?: string;
  createdAt?: string;
  updatedAt?: string;
  lastModified?: string;

  // Personal Information
  contact: ContactInfo;
  summary: string;

  // Core Sections
  experience: Experience[];
  education: Education[];
  skills: Skills;
  projects: Project[];

  // Optional Sections
  certifications?: Certification[];
  awards?: Award[];
  publications?: Publication[];
  volunteer?: Volunteer[];
  languages?: Language[];
  customSections?: CustomSection[];

  // Template Configuration
  template?: {
    layout: 'single-column' | 'two-column' | 'modern';
    sections: {
      contact: boolean;
      summary: boolean;
      experience: boolean;
      education: boolean;
      skills: boolean;
      projects: boolean;
      certifications: boolean;
      awards: boolean;
      publications: boolean;
      volunteer: boolean;
      languages: boolean;
    };
    styling: {
      primaryColor: string;
      secondaryColor: string;
      fontFamily: string;
      fontSize: 'small' | 'medium' | 'large';
    };
  };
}

// Template Configuration
export interface TemplateConfig {
  layout: 'single-column' | 'two-column' | 'modern';
  sections: {
    contact: boolean;
    summary: boolean;
    experience: boolean;
    education: boolean;
    skills: boolean;
    projects: boolean;
    certifications: boolean;
    awards: boolean;
    publications: boolean;
    volunteer: boolean;
    languages: boolean;
  };
  styling: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    fontSize: 'small' | 'medium' | 'large';
  };
}

// CV Processing Status
export interface CVProcessingStatus {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  message?: string;
  errors?: string[];
  result?: CVData;
}

// AI Processing Request
export interface AIProcessingRequest {
  type: 'parse' | 'tailor' | 'enhance' | 'suggestions';
  cvData: CVData;
  jobDescription?: string;
  requirements?: string[];
  customInstructions?: string;
}

// AI Processing Response
export interface AIProcessingResponse {
  success: boolean;
  data?: CVData;
  suggestions?: string[];
  errors?: string[];
  processingTime?: number;
}
