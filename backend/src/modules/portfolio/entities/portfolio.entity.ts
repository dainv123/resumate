import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { PortfolioTemplate } from '../dto/portfolio.dto';

@Entity('portfolios')
export class Portfolio {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  username: string;

  @Column()
  uuid: string;

  @Column({
    type: 'enum',
    enum: PortfolioTemplate,
  })
  template: PortfolioTemplate;

  @Column({ type: 'text', nullable: true })
  customDomain: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ type: 'text', nullable: true })
  avatar: string;

  @Column({ type: 'text', nullable: true })
  linkedinUrl: string;

  @Column({ type: 'text', nullable: true })
  githubUrl: string;

  @Column({ type: 'text', nullable: true })
  websiteUrl: string;

  @Column({ type: 'text', nullable: true })
  generatedHtml: string;

  @Column({ type: 'text', nullable: true })
  generatedUrl: string;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}