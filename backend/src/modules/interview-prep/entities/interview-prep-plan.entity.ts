import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { JobDescription } from '../../cv/entities/job-description.entity';
import { Cv } from '../../cv/entities/cv.entity';
import { PrepPlanStatus } from '../constants/interview-prep.constants';
import {
  PlanStarStory,
  ProjectDefenseSheet,
} from '../domain/interview-prep-ai.types';
import { InterviewQuestionAssignment } from './interview-question-assignment.entity';

export interface ReadinessBreakdown {
  compatibility: number;
  questionCoverage: number;
  starReadiness: number;
  companyResearch: number;
  mockPerformance: number;
}

@Entity('interview_prep_plans')
export class InterviewPrepPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  jobDescriptionId: string;

  @Column()
  cvId: string;

  @Column({ type: 'date' })
  interviewDate: Date;

  @Column({ type: 'int', default: 60 })
  dailyCapacityMinutes: number;

  @Column('jsonb')
  processMap: Record<string, unknown>;

  @Column('jsonb')
  roadmap: Record<string, unknown>[];

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  readinessScore: number;

  @Column('jsonb', { nullable: true })
  readinessBreakdown: ReadinessBreakdown;

  @Column('jsonb', { nullable: true })
  starStories: PlanStarStory[];

  @Column('jsonb', { nullable: true })
  projectDefenses: ProjectDefenseSheet[];

  @Column({ type: 'varchar', default: PrepPlanStatus.DRAFT })
  status: PrepPlanStatus;

  @Column({ type: 'date', nullable: true })
  lastReminderDate: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => JobDescription)
  @JoinColumn({ name: 'jobDescriptionId' })
  jobDescription: JobDescription;

  @ManyToOne(() => Cv)
  @JoinColumn({ name: 'cvId' })
  cv: Cv;

  @OneToMany(() => InterviewQuestionAssignment, (a) => a.plan)
  questionAssignments: InterviewQuestionAssignment[];
}
