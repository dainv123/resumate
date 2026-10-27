import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  QuestionCategory,
  QuestionFrequency,
  QuestionLevel,
} from '../constants/interview-prep.constants';

@Entity('question_bank')
export class QuestionBank {
  @PrimaryColumn()
  id: string;

  @Column({ type: 'varchar' })
  category: QuestionCategory;

  @Column({ type: 'varchar', nullable: true })
  subcategory: string;

  @Column({ type: 'varchar' })
  level: QuestionLevel;

  @Column('jsonb')
  roleTags: string[];

  @Column('jsonb')
  skillTags: string[];

  @Column({ type: 'int', default: 3 })
  difficulty: number;

  @Column({ type: 'varchar' })
  frequency: QuestionFrequency;

  @Column('text')
  question: string;

  @Column('jsonb')
  evaluationRubric: {
    excellent: string[];
    good: string[];
    weak: string[];
  };

  @Column('jsonb')
  sampleAnswerOutline: string[];

  @Column('jsonb')
  followUpQuestions: string[];

  @Column({ type: 'int', default: 15 })
  prepTimeMinutes: number;

  @Column({ default: 'curated' })
  source: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
