import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { JobDescription } from './job-description.entity';
import type { CVData } from '../../../shared/interfaces/cv-data.interface';

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
  jobDescriptionData: any;

  @Column('jsonb', { nullable: true })
  matchingAnalysis: any;

  @Column('text', { nullable: true })
  coverLetter: string;

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