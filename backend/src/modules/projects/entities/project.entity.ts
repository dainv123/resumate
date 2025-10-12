import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  name: string;

  @Column()
  role: string;

  @Column('text', { array: true })
  techStack: string[];

  @Column('text')
  description: string;

  @Column({ nullable: true })
  results: string;

  @Column('text', { array: true, default: [] })
  cvBullets: string[];

  @Column({ nullable: true })
  demoLink: string;

  @Column({ nullable: true })
  githubLink: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column('text', { array: true, default: [] })
  cvIds: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, user => user.projects)
  @JoinColumn({ name: 'userId' })
  user: User;
}