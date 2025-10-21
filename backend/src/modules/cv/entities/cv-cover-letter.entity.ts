import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Cv } from './cv.entity';
import { User } from '../../users/entities/user.entity';

@Entity('cv_cover_letters')
export class CvCoverLetter {
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
