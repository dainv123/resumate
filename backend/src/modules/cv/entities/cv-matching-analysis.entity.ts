import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { JobDescription } from './job-description.entity';
import { Cv } from './cv.entity';

@Entity('cv_matching_analyses')
@Index(['cvId', 'jobDescriptionId', 'userId'], { unique: true })
export class CvMatchingAnalysis {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  cvId: string;

  @Column()
  jobDescriptionId: string;

  @Column()
  userId: string;

  @Column('jsonb', { nullable: true })
  jobDescriptionSnapshot: {
    title: string;
    company?: string;
    description: string; // Truncated to 500 chars
    keyRequirements: string[]; // Only top 5 requirements
    experience?: string;
    createdAt: string; // When snapshot was taken
  };

  @Column('int')
  score: number;

  @Column('jsonb')
  matchedSkills: string[];

  @Column('jsonb')
  missingSkills: string[];

  @Column('jsonb')
  suggestions: string[];

  @Column('jsonb')
  strengths: string[];

  @Column('text', { nullable: true })
  notes: string;

  @Column({ default: false })
  isSnapshot: boolean;

  @Column({ nullable: true })
  snapshotReason: string;

  @Column({ nullable: true })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Cv, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cvId' })
  cv: Cv;

  @ManyToOne(() => JobDescription)
  @JoinColumn({ name: 'jobDescriptionId' })
  jobDescription: JobDescription;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'userId' })
  user: User;
}