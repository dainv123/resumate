import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class TemplateLoaderService {
  private readonly templatesPath = __dirname;

  async loadTemplate(templateName: string): Promise<string> {
    const templateFile = path.join(this.templatesPath, `${templateName}.template.html`);
    
    try {
      return fs.readFileSync(templateFile, 'utf-8');
    } catch (error) {
      throw new Error(`Template not found: ${templateName} at ${templateFile}`);
    }
  }

  getAvailableTemplates(): string[] {
    try {
      const files = fs.readdirSync(this.templatesPath);
      return files
        .filter(file => file.endsWith('.template.html'))
        .map(file => file.replace('.template.html', ''));
    } catch (error) {
      return [];
    }
  }
}