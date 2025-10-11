import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export interface TemplateMetadata {
  category: 'professional' | 'creative' | 'modern';
  color: string;
  preview: string;
  thumbnail?: string;
  features?: string[];
}

@Entity('templates')
export class Template {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string; // 'professional', 'two-column', 'modern', etc.

  @Column()
  displayName: string; // 'Professional', 'Modern Two-Column', etc.

  @Column()
  description: string;

  @Column('jsonb')
  metadata: TemplateMetadata;

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

