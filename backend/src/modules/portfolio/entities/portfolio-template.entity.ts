import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export interface PortfolioTemplateMetadata {
  category: 'basic' | 'creative' | 'modern' | 'developer';
  color: string;
  preview: string;
  thumbnail?: string;
  features?: string[];
  sections: {
    hero: boolean;
    about: boolean;
    skills: boolean;
    experience: boolean;
    education: boolean;
    projects: boolean;
    certifications: boolean;
    awards: boolean;
    contact: boolean;
  };
  allowCustomization: boolean;
}

@Entity('portfolio_templates')
export class PortfolioTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string; // 'basic', 'creative', 'modern', 'muhammad-ismail'

  @Column()
  displayName: string; // 'Basic', 'Creative', 'Modern', 'Developer Pro'

  @Column()
  description: string;

  @Column()
  fileName: string; // 'basic.template.html'

  @Column('jsonb')
  metadata: PortfolioTemplateMetadata;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isPremium: boolean;

  @Column({ default: 0 })
  usageCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

