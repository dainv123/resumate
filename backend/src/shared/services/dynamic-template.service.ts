import { Injectable, Logger } from '@nestjs/common';
import { CVData, TemplateConfig } from '../interfaces/cv-data.interface';
import { CVDataUtils } from '../utils/cv-data.utils';

// TemplateConfig is now imported from interfaces

export interface SectionData {
  hasData: boolean;
  title: string;
  content: string;
  priority: number; // Để sắp xếp thứ tự hiển thị
}

@Injectable()
export class DynamicTemplateService {
  private readonly logger = new Logger(DynamicTemplateService.name);

  /**
   * Phát hiện sections có data trong CV
   */
  detectAvailableSections(cvData: CVData, showEmptySections: boolean = false): SectionData[] {
    const sections: SectionData[] = [];

    // Contact Information - Luôn có
    sections.push({
      hasData: true,
      title: 'Contact',
      content: this.generateContactSection(cvData),
      priority: 1
    });

    // Summary
    if (cvData.summary && cvData.summary.trim()) {
      sections.push({
        hasData: true,
        title: 'Summary',
        content: this.generateSummarySection(cvData),
        priority: 2
      });
    }

    // Experience
    if (cvData.experience && cvData.experience.length > 0) {
      sections.push({
        hasData: true,
        title: 'Experience',
        content: this.generateExperienceSection(cvData),
        priority: 3
      });
    }

    // Education
    if (cvData.education && cvData.education.length > 0) {
      sections.push({
        hasData: true,
        title: 'Education',
        content: this.generateEducationSection(cvData),
        priority: 4
      });
    }

    // Skills
    if (
      cvData.skills &&
      ((cvData.skills.technical && cvData.skills.technical.length > 0) ||
        (cvData.skills.soft && cvData.skills.soft.length > 0) ||
        (cvData.skills.languages && cvData.skills.languages.length > 0))
    ) {
      sections.push({
        hasData: true,
        title: 'Skills',
        content: this.generateSkillsSection(cvData),
        priority: 5
      });
    }

    // Projects
    if (cvData.projects && cvData.projects.length > 0) {
      sections.push({
        hasData: true,
        title: 'Projects',
        content: this.generateProjectsSection(cvData),
        priority: 6
      });
    }

    // Certifications
    if (cvData.certifications && cvData.certifications.length > 0) {
      sections.push({
        hasData: true,
        title: 'Certifications',
        content: this.generateCertificationsSection(cvData),
        priority: 7
      });
    } else if (showEmptySections) {
      sections.push({
        hasData: false,
        title: 'Certifications',
        content: '<div class="empty-section">No certifications available</div>',
        priority: 7
      });
    }

    // Awards
    if (cvData.awards && cvData.awards.length > 0) {
      sections.push({
        hasData: true,
        title: 'Awards',
        content: this.generateAwardsSection(cvData),
        priority: 8
      });
    } else if (showEmptySections) {
      sections.push({
        hasData: false,
        title: 'Awards',
        content: '<div class="empty-section">No awards available</div>',
        priority: 8
      });
    }

    // Publications
    if (cvData.publications && cvData.publications.length > 0) {
      sections.push({
        hasData: true,
        title: 'Publications',
        content: this.generatePublicationsSection(cvData),
        priority: 9
      });
    } else if (showEmptySections) {
      sections.push({
        hasData: false,
        title: 'Publications',
        content: '<div class="empty-section">No publications available</div>',
        priority: 9
      });
    }

    // Volunteer
    if (cvData.volunteer && cvData.volunteer.length > 0) {
      sections.push({
        hasData: true,
        title: 'Volunteer Experience',
        content: this.generateVolunteerSection(cvData),
        priority: 10
      });
    } else if (showEmptySections) {
      sections.push({
        hasData: false,
        title: 'Volunteer Experience',
        content: '<div class="empty-section">No volunteer experience available</div>',
        priority: 10
      });
    }

    return sections.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Tạo template HTML động dựa trên config và sections có data
   */
  generateDynamicTemplate(cvData: CVData, config: TemplateConfig, showEmptySections: boolean = false): string {
    // Normalize CV data first
    const normalizedCVData = CVDataUtils.normalizeCVData(cvData);
    
    const availableSections = this.detectAvailableSections(normalizedCVData, showEmptySections);
    
    // Đảm bảo config có sections property
    if (!config.sections) {
      config = CVDataUtils.getDefaultTemplateConfig();
    }
    
    const sectionsToRender = availableSections.filter((section) =>
      config.sections[
        section.title
          .toLowerCase()
          .replace(' ', '') as keyof typeof config.sections
      ],
    );

    this.logger.log(`Generating dynamic template with ${sectionsToRender.length} sections`);

    return this.generateHtmlTemplate(normalizedCVData, sectionsToRender, config);
  }

  /**
   * Tạo template HTML hoàn chỉnh
   */
  private generateHtmlTemplate(cvData: CVData, sections: SectionData[], config: TemplateConfig): string {
    const { primaryColor, secondaryColor, fontFamily, fontSize } = config.styling;
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${cvData.contact.name} - Resume</title>
    <style>
        ${this.generateStyles(config)}
    </style>
</head>
<body class="${config.layout}">
    <div class="resume-container">
        ${this.generateHeader(cvData, config)}
        
        <div class="content-wrapper">
            ${config.layout === 'two-column' ? this.generateTwoColumnLayout(sections, config) : this.generateSingleColumnLayout(sections, config)}
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Tạo CSS styles động
   */
  private generateStyles(config: TemplateConfig): string {
    const { primaryColor, secondaryColor, fontFamily, fontSize } = config.styling;
    const baseFontSize = fontSize === 'small' ? '14px' : fontSize === 'large' ? '16px' : '15px';

    return `
        :root {
            --primary-color: ${primaryColor};
            --secondary-color: ${secondaryColor};
            --font-family: ${fontFamily};
            --base-font-size: ${baseFontSize};
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: var(--font-family);
            font-size: var(--base-font-size);
            line-height: 1.6;
            color: var(--secondary-color);
            background: #f8f9fa;
        }

        .resume-container {
            max-width: 210mm;
            margin: 0 auto;
            background: white;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }

        .header {
            background: var(--primary-color);
            color: white;
            padding: 2rem;
            text-align: center;
        }

        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
            font-weight: 700;
        }

        .header .contact-info {
            font-size: 1.1rem;
            opacity: 0.9;
        }

        .content-wrapper {
            padding: 2rem;
        }

        .two-column .content-wrapper {
            display: grid;
            grid-template-columns: 1fr 2fr;
            gap: 2rem;
        }

        .section {
            margin-bottom: 2rem;
        }

        .section-title {
            font-size: 1.4rem;
            font-weight: 700;
            color: var(--primary-color);
            border-bottom: 3px solid var(--primary-color);
            padding-bottom: 0.5rem;
            margin-bottom: 1rem;
        }

        .item {
            margin-bottom: 1.5rem;
            padding: 1rem;
            border-left: 4px solid var(--primary-color);
            background: #f8f9fa;
        }

        .item-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 0.5rem;
        }

        .item-title {
            font-weight: 600;
            font-size: 1.1rem;
            color: var(--secondary-color);
        }

        .item-date {
            color: var(--primary-color);
            font-weight: 500;
        }

        .item-company {
            color: #666;
            font-style: italic;
            margin-bottom: 0.5rem;
        }

        .skills-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
        }

        .skill-category h4 {
            color: var(--primary-color);
            margin-bottom: 0.5rem;
        }

        .skill-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
        }

        .skill-tag {
            background: var(--primary-color);
            color: white;
            padding: 0.25rem 0.75rem;
            border-radius: 15px;
            font-size: 0.9rem;
        }

        ul {
            margin: 0.5rem 0;
            padding-left: 1.5rem;
        }

        li {
            margin-bottom: 0.25rem;
        }

        .contact-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-top: 1rem;
        }

        .contact-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .empty-section {
            color: #999;
            font-style: italic;
            text-align: center;
            padding: 1rem;
            border: 1px dashed #ddd;
            border-radius: 5px;
            background: #f9f9f9;
        }

        @media print {
            body {
                background: white;
            }
            .resume-container {
                box-shadow: none;
            }
        }
    `;
  }

  /**
   * Tạo header section
   */
  private generateHeader(cvData: CVData, config: TemplateConfig): string {
    return `
    <div class="header">
        <h1>${cvData.contact.name}</h1>
        <div class="contact-info">
            <div class="contact-grid">
                <div class="contact-item">
                    <span>📧</span>
                    <span>${cvData.contact.email}</span>
                </div>
                <div class="contact-item">
                    <span>📞</span>
                    <span>${cvData.contact.phone || ''}</span>
                </div>
                ${cvData.contact.address ? `
                <div class="contact-item">
                    <span>📍</span>
                    <span>${cvData.contact.address}</span>
                </div>
                ` : ''}
                ${cvData.contact.linkedin ? `
                <div class="contact-item">
                    <span>💼</span>
                    <a href="${cvData.contact.linkedin}" target="_blank" style="color: white;">LinkedIn</a>
                </div>
                ` : ''}
            </div>
        </div>
    </div>`;
  }

  /**
   * Layout single column
   */
  private generateSingleColumnLayout(sections: SectionData[], config: TemplateConfig): string {
    return sections.map(section => `
      <div class="section">
        <h2 class="section-title">${section.title}</h2>
        ${section.content}
      </div>
    `).join('');
  }

  /**
   * Layout two column
   */
  private generateTwoColumnLayout(sections: SectionData[], config: TemplateConfig): string {
    // Phân chia sections cho 2 cột
    const leftColumnSections = ['Contact', 'Skills', 'Certifications', 'Awards'];
    const rightColumnSections = ['Summary', 'Experience', 'Education', 'Projects', 'Publications', 'Volunteer Experience'];

    const leftSections = sections.filter(s => leftColumnSections.includes(s.title));
    const rightSections = sections.filter(s => rightColumnSections.includes(s.title));

    return `
      <div class="left-column">
        ${leftSections.map(section => `
          <div class="section">
            <h2 class="section-title">${section.title}</h2>
            ${section.content}
          </div>
        `).join('')}
      </div>
      <div class="right-column">
        ${rightSections.map(section => `
          <div class="section">
            <h2 class="section-title">${section.title}</h2>
            ${section.content}
          </div>
        `).join('')}
      </div>
    `;
  }

  // ========== SECTION GENERATORS ==========

  private generateContactSection(cvData: CVData): string {
    return `
      <div class="contact-details">
        <div class="contact-item"><strong>Name:</strong> ${cvData.contact.name}</div>
        <div class="contact-item"><strong>Email:</strong> ${cvData.contact.email}</div>
        <div class="contact-item"><strong>Phone:</strong> ${cvData.contact.phone || ''}</div>
        ${cvData.contact.address ? `<div class="contact-item"><strong>Address:</strong> ${cvData.contact.address}</div>` : ''}
        ${cvData.contact.linkedin ? `<div class="contact-item"><strong>LinkedIn:</strong> <a href="${cvData.contact.linkedin}">${cvData.contact.linkedin}</a></div>` : ''}
        ${cvData.contact.github ? `<div class="contact-item"><strong>GitHub:</strong> <a href="${cvData.contact.github}">${cvData.contact.github}</a></div>` : ''}
        ${cvData.contact.website ? `<div class="contact-item"><strong>Website:</strong> <a href="${cvData.contact.website}">${cvData.contact.website}</a></div>` : ''}
      </div>
    `;
  }

  private generateSummarySection(cvData: CVData): string {
    return `<div class="summary-content">${cvData.summary}</div>`;
  }

  private generateExperienceSection(cvData: CVData): string {
    return cvData.experience.map(exp => `
      <div class="item">
        <div class="item-header">
          <div class="item-title">${exp.title}</div>
          <div class="item-date">${this.formatDateRange(exp.startDate, exp.endDate, exp.current)}</div>
        </div>
        <div class="item-company">${exp.company}</div>
        ${exp.teamSize ? `<div class="team-size"><strong>Team Size:</strong> ${exp.teamSize}</div>` : ''}
        ${exp.companyDescription ? `<div class="company-description">${exp.companyDescription}</div>` : ''}
        
        ${exp.responsibilities && exp.responsibilities.length > 0 ? `
          <div class="responsibilities">
            <strong>Responsibilities:</strong>
            <ul>
              ${exp.responsibilities.map(resp => `<li>${resp}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
        
        ${exp.achievements && exp.achievements.length > 0 ? `
          <div class="achievements">
            <strong>Achievements:</strong>
            <ul>
              ${exp.achievements.map(ach => `<li>${ach}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
        
        ${exp.technologies && exp.technologies.length > 0 ? `
          <div class="tech-stack">
            <strong>Technologies:</strong> ${exp.technologies.join(', ')}
          </div>
        ` : ''}
        
        ${exp.description ? `<div class="description">${exp.description}</div>` : ''}
      </div>
    `).join('');
  }

  private generateEducationSection(cvData: CVData): string {
    return cvData.education.map(edu => `
      <div class="item">
        <div class="item-header">
          <div class="item-title">${edu.degree}</div>
          <div class="item-date">${this.formatDateRange(edu.startDate, edu.endDate)}</div>
        </div>
        <div class="item-company">${edu.institution}${edu.location ? `, ${edu.location}` : ''}</div>
        ${edu.description ? `<div class="description">${edu.description}</div>` : ''}
        ${edu.gpa ? `<div class="gpa"><strong>GPA:</strong> ${edu.gpa}</div>` : ''}
      </div>
    `).join('');
  }

  private generateSkillsSection(cvData: CVData): string {
    return `
      <div class="skills-grid">
        ${cvData.skills.technical && cvData.skills.technical.length > 0 ? `
          <div class="skill-category">
            <h4>Technical Skills</h4>
            <div class="skill-tags">
              ${cvData.skills.technical.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
            </div>
          </div>
        ` : ''}
        
        ${cvData.skills.soft && cvData.skills.soft.length > 0 ? `
          <div class="skill-category">
            <h4>Soft Skills</h4>
            <div class="skill-tags">
              ${cvData.skills.soft.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
            </div>
          </div>
        ` : ''}
        
        ${cvData.skills.languages && cvData.skills.languages.length > 0 ? `
          <div class="skill-category">
            <h4>Languages</h4>
            <div class="skill-tags">
              ${cvData.skills.languages.map(lang => `<span class="skill-tag">${lang}</span>`).join('')}
            </div>
          </div>
        ` : ''}
        
        ${cvData.skills.tools && cvData.skills.tools.length > 0 ? `
          <div class="skill-category">
            <h4>Tools</h4>
            <div class="skill-tags">
              ${cvData.skills.tools.map(tool => `<span class="skill-tag">${tool}</span>`).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  private generateProjectsSection(cvData: CVData): string {
    return cvData.projects.map(project => `
      <div class="item">
        <div class="item-header">
          <div class="item-title">${project.name}</div>
          ${project.duration ? `<div class="item-date">${project.duration}</div>` : ''}
        </div>
        <div class="description">${project.description}</div>
        ${project.technologies && project.technologies.length > 0 ? `
          <div class="tech-stack"><strong>Tech Stack:</strong> ${project.technologies.join(', ')}</div>
        ` : ''}
        ${project.results ? `<div class="results"><strong>Results:</strong> ${Array.isArray(project.results) ? project.results.join(', ') : project.results}</div>` : ''}
        ${project.link ? `<div class="project-link"><strong>Link:</strong> <a href="${project.link}">${project.link}</a></div>` : ''}
      </div>
    `).join('');
  }

  private generateCertificationsSection(cvData: CVData): string {
    return (cvData.certifications || []).map(cert => `
      <div class="item">
        <div class="item-header">
          <div class="item-title">${cert.name}</div>
          <div class="item-date">${cert.date}</div>
        </div>
        <div class="item-company">${cert.issuer}</div>
        ${cert.credentialUrl ? `<div class="cert-link"><strong>Link:</strong> <a href="${cert.credentialUrl}">${cert.credentialUrl}</a></div>` : ''}
      </div>
    `).join('');
  }

  private generateAwardsSection(cvData: CVData): string {
    return (cvData.awards || []).map(award => `
      <div class="item">
        <div class="item-header">
          <div class="item-title">${award.title}</div>
          <div class="item-date">${award.date}</div>
        </div>
        <div class="item-company">${award.issuer}</div>
      </div>
    `).join('');
  }

  private generatePublicationsSection(cvData: CVData): string {
    return (cvData.publications || []).map(pub => `
      <div class="item">
        <div class="item-header">
          <div class="item-title">${pub.title}</div>
          <div class="item-date">${pub.publicationDate}</div>
        </div>
        <div class="item-company">${pub.journal}</div>
        <div class="authors"><strong>Authors:</strong> ${Array.isArray(pub.authors) ? pub.authors.join(', ') : pub.authors}</div>
      </div>
    `).join('');
  }

  private generateVolunteerSection(cvData: CVData): string {
    return (cvData.volunteer || []).map(vol => `
      <div class="item">
        <div class="item-header">
          <div class="item-title">${vol.role}</div>
          <div class="item-date">${this.formatDateRange(vol.startDate, vol.endDate, vol.current)}</div>
        </div>
        <div class="item-company">${vol.organization}</div>
        <div class="description">${vol.description}</div>
      </div>
    `).join('');
  }

  /**
   * Tạo config mặc định
   */
  getDefaultConfig(): TemplateConfig {
    return {
      layout: 'single-column',
      sections: {
        contact: true,
        summary: true,
        experience: true,
        education: true,
        skills: true,
        projects: true,
        certifications: true,
        awards: true,
        publications: true,
        volunteer: true,
        languages: true
      },
      styling: {
        primaryColor: '#2c3e50',
        secondaryColor: '#34495e',
        fontFamily: 'Arial, sans-serif',
        fontSize: 'medium'
      }
    };
  }

  /**
   * Tạo config cho two-column layout
   */
  getTwoColumnConfig(): TemplateConfig {
    return {
      ...this.getDefaultConfig(),
      layout: 'two-column',
      styling: {
        ...this.getDefaultConfig().styling,
        primaryColor: '#3498db'
      }
    };
  }

  /**
   * Tạo config cho modern layout
   */
  getModernConfig(): TemplateConfig {
    return {
      ...this.getDefaultConfig(),
      layout: 'single-column',
      styling: {
        primaryColor: '#e74c3c',
        secondaryColor: '#2c3e50',
        fontFamily: 'Helvetica, Arial, sans-serif',
        fontSize: 'medium'
      }
    };
  }

  /**
   * Tạo config hiển thị tất cả sections (kể cả rỗng)
   */
  getShowAllConfig(): TemplateConfig {
    return {
      layout: 'two-column',
      sections: {
        contact: true,
        summary: true,
        experience: true,
        education: true,
        skills: true,
        projects: true,
        certifications: true,
        awards: true,
        publications: true,
        volunteer: true,
        languages: true
      },
      styling: {
        primaryColor: '#2c3e50',
        secondaryColor: '#34495e',
        fontFamily: 'Arial, sans-serif',
        fontSize: 'medium'
      }
    };
  }

  /**
   * Format date range for display
   */
  private formatDateRange(startDate: string, endDate?: string, current?: boolean): string {
    if (current || !endDate) {
      return startDate + ' - Present';
    }
    return startDate + ' - ' + endDate;
  }

}