import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Cv } from './cv.entity';
import { User } from '../../users/entities/user.entity';

@Entity('cv_matching_analyses')
export class CvMatchingAnalysis {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  cvId: string;

  @Column()
  userId: string;

  @Column('jsonb')
  jobDescription: {
    title: string;
    company?: string;
    location?: string;
    salary?: string;
    experience?: string;
    description: string;
    requirements: string[];
    benefits: string[];
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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Cv, cv => cv.id)
  @JoinColumn({ name: 'cvId' })
  cv: Cv;

  @ManyToOne(() => User, user => user.id)
  @JoinColumn({ name: 'userId' })
  user: User;
}
