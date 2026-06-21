import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  AssignmentStatus,
  GapPriority,
} from '../constants/interview-prep.constants';
import { InterviewPrepPlan } from './interview-prep-plan.entity';

export interface StarStoryContent {
  question: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  projectRef?: string;
  ready: boolean;
}

export interface MockScoreEntry {
  score: number;
  feedback: string;
  attemptedAt: string;
}

@Entity('interview_question_assignments')
export class InterviewQuestionAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  planId: string;

  @Column()
  questionId: string;

  @Column({ type: 'varchar' })
  priority: GapPriority;

  @Column({ type: 'decimal', precision: 6, scale: 2 })
  impactScore: number;

  @Column('text', { nullable: true })
  userAnswer: string;

  @Column('jsonb', { nullable: true })
  starStory: StarStoryContent;

  @Column('jsonb', { nullable: true })
  mockScores: MockScoreEntry[];

  @Column({ type: 'varchar', default: AssignmentStatus.PENDING })
  status: AssignmentStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => InterviewPrepPlan, (plan) => plan.questionAssignments)
  @JoinColumn({ name: 'planId' })
  plan: InterviewPrepPlan;
}
