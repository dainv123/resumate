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

@Entity('cv_cover_letters')
@Index(['cvId', 'jobDescriptionId', 'userId'], { unique: true })
export class CvCoverLetter {
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

  @Column('text')
  content: string;

  @Column('text', { nullable: true })
  personalizedContent: string;

  @Column('varchar', { length: 50, default: 'professional' })
  tone: string;

  @Column('varchar', { length: 50, default: 'standard' })
  format: string;

  @Column('int', { default: 0 })
  wordCount: number;

  @Column('boolean', { default: false })
  isCustomized: boolean;

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
