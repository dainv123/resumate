import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Cv } from '../../cv/entities/cv.entity';
import { Project } from '../../projects/entities/project.entity';
import { UserUsage } from './user-usage.entity';
import { JobDescription } from '../../cv/entities/job-description.entity';

export enum UserPlan {
  FREE = 'free',
  PRO = 'pro',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ default: UserPlan.FREE })
  plan: UserPlan;

  @Column({ nullable: true })
  googleId: string;

  @Column({ nullable: true })
  password: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Cv, cv => cv.user)
  cvs: Cv[];

  @OneToMany(() => Project, project => project.user)
  projects: Project[];

  @OneToMany(() => UserUsage, usage => usage.user)
  usage: UserUsage[];

  @OneToMany(() => JobDescription, jobDescription => jobDescription.user)
  jobDescriptions: JobDescription[];
}