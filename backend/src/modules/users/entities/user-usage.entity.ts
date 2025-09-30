import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('user_usage')
export class UserUsage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ default: 0 })
  cvUploads: number;

  @Column({ default: 0 })
  projects: number;

  @Column({ default: 0 })
  jobTailors: number;

  @Column({ default: 0 })
  exports: number;

  @Column({ type: 'date' })
  resetDate: Date;

  @ManyToOne(() => User, user => user.usage)
  @JoinColumn({ name: 'userId' })
  user: User;
}