import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Cv } from './cv.entity';

@Entity('job_descriptions')
export class JobDescription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({ nullable: true })
  company: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  salary: string;

  @Column({ nullable: true })
  experience: string;

  @Column('jsonb', { nullable: true })
  requirements: {
    skills: string[];
    education: string[];
    experience: string[];
    certifications: string[];
  };

  @Column('jsonb', { nullable: true })
  keywords: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, user => user.jobDescriptions)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => Cv, cv => cv.jobDescription)
  tailoredCvs: Cv[];
}