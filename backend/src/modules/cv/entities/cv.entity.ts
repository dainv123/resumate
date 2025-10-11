import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { JobDescription } from './job-description.entity';

export interface Education {
  degree: string;
  school: string;
  year: string;
  gpa?: string;
  location?: string;
  honors?: string;
}

export interface SubProject {
  name?: string;
  role?: string;
  techStack?: string[];
  responsibilities?: string[];
}

export interface Experience {
  title: string;
  company: string;
  duration: string;
  teamSize?: string;
  companyDescription?: string;
  responsibilities?: string[];
  achievements?: string[];
  technologies?: string[];
  subProjects?: SubProject[];
}

export interface Project {
  name: string;
  description: string;
  techStack: string[];
  results?: string;
  link?: string;
  duration?: string;
}

export interface Certification {
  name: string;
  issuer: string;
  date: string;
  link?: string;
}

export interface Award {
  name: string;
  issuer: string;
  date: string;
}

export interface Publication {
  title: string;
  journal: string;
  date: string;
  authors: string;
}

export interface Volunteer {
  role: string;
  organization: string;
  duration: string;
  description: string;
}

export interface Reference {
  name: string;
  title: string;
  company: string;
  contact: string;
}

export interface Skills {
  technical: string[];
  soft: string[];
  languages: string[];
  tools: string[];
}

export interface CVData {
  name: string;
  email: string;
  phone: string;
  address?: string;
  linkedin?: string;
  dateOfBirth?: string;
  summary?: string;
  education: Education[];
  experience: Experience[];
  skills: Skills;
  projects: Project[];
  certifications: Certification[];
  awards: Award[];
  publications: Publication[];
  volunteer: Volunteer[];
}

@Entity('cvs')
export class Cv {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  originalFileName: string;

  @Column()
  fileUrl: string;

  @Column('jsonb')
  parsedData: CVData;

  @Column({ default: 1 })
  version: number;

  @Column({ default: false })
  isTailored: boolean;

  @Column({ nullable: true })
  tailoredForJob: string;

  @Column({ nullable: true })
  originalCvId: string;

  @Column({ nullable: true })
  jobDescriptionId: string;

  @Column('jsonb', { nullable: true })
  improvementNotes: {
    parsingImprovements: string[];
    templateEnhancements: string[];
    dataCompleteness: string[];
    lastUpdated: string;
  };

  @Column('jsonb', { nullable: true, default: () => "'[]'" })
  versionHistory: {
    version: number;
    parsedData: CVData;
    updatedAt: string;
    updatedBy?: string;
  }[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, user => user.cvs)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => JobDescription, jobDescription => jobDescription.tailoredCvs, { nullable: true })
  @JoinColumn({ name: 'jobDescriptionId' })
  jobDescription: JobDescription;

  @ManyToOne(() => Cv, cv => cv.tailoredVersions, { nullable: true })
  @JoinColumn({ name: 'originalCvId' })
  originalCv: Cv;

  @OneToMany(() => Cv, cv => cv.originalCv)
  tailoredVersions: Cv[];
}