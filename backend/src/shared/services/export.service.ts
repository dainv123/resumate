import { Injectable, Logger } from '@nestjs/common';
import { CVData } from '../../modules/cv/entities/cv.entity';
import { Document as WordDocument, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
// Dynamic import for ESM module
import React from 'react';
import { HtmlTemplateService } from './html-template.service';

@Injectable()
export class ExportService {
  private readonly logger = new Logger(ExportService.name);
  
  constructor(private readonly htmlTemplateService: HtmlTemplateService) {}

  async exportToPDF(cvData: CVData, template: string = 'professional'): Promise<Buffer> {
    try {
      this.logger.log(`Starting PDF generation with template: ${template}...`);
      
      if (template === 'two-column') {
        return this.exportHtmlToPDF(cvData);
      }
      
      // Default React PDF for professional template
      // Dynamic import for ESM module
      const { pdf } = await import('@react-pdf/renderer');
      
      const ReactPDFDocument = await this.generateReactPDFDocument(cvData, template);
      
      const pdfBlob = await pdf(ReactPDFDocument).toBlob();
      
      // Convert Blob to Buffer
      const arrayBuffer = await pdfBlob.arrayBuffer();
      const pdfBuffer = Buffer.from(arrayBuffer);
      
      if (!pdfBuffer || pdfBuffer.length === 0) {
        throw new Error('Generated PDF is empty');
      }

      this.logger.log(`PDF generated successfully, size: ${pdfBuffer.length} bytes`);
      return pdfBuffer;
    } catch (error) {
      this.logger.error('Error generating PDF:', error);
      throw new Error(`Failed to generate PDF: ${error.message}`);
    }
  }

  async exportToWord(cvData: CVData): Promise<Buffer> {
    try {
      const doc = new WordDocument({
        sections: [{
          properties: {},
          children: [
            // Header
            new Paragraph({
              children: [
                new TextRun({
                  text: cvData.name,
                  bold: true,
                  size: 32,
                }),
              ],
              heading: HeadingLevel.HEADING_1,
            }),
            
            new Paragraph({
              children: [
                new TextRun({
                  text: `${cvData.email} | ${cvData.phone}`,
                  size: 24,
                }),
              ],
            }),

            // Summary
            ...(cvData.summary ? [
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'SUMMARY',
                    bold: true,
                    size: 28,
                  }),
                ],
                heading: HeadingLevel.HEADING_2,
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: cvData.summary,
                    size: 24,
                  }),
                ],
              }),
            ] : []),

            // Experience
            new Paragraph({
              children: [
                new TextRun({
                  text: 'EXPERIENCE',
                  bold: true,
                  size: 28,
                }),
              ],
              heading: HeadingLevel.HEADING_2,
            }),
            
            ...cvData.experience.flatMap(exp => [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${exp.title} at ${exp.company}`,
                    bold: true,
                    size: 26,
                  }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: exp.duration,
                    italics: true,
                    size: 22,
                  }),
                ],
              }),
              ...(exp.teamSize ? [new Paragraph({
                children: [
                  new TextRun({
                    text: `👥 Team Size: ${exp.teamSize}`,
                    size: 22,
                  }),
                ],
              })] : []),
              ...(exp.companyDescription ? [new Paragraph({
                children: [
                  new TextRun({
                    text: exp.companyDescription,
                    size: 22,
                  }),
                ],
              })] : []),
              ...(exp.responsibilities && exp.responsibilities.length > 0 ? [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: 'Responsibilities:',
                      bold: true,
                      size: 24,
                    }),
                  ],
                }),
                ...exp.responsibilities.map(resp => new Paragraph({
                  children: [
                    new TextRun({
                      text: `• ${resp}`,
                      size: 22,
                    }),
                  ],
                })),
              ] : []),
              ...(exp.achievements && exp.achievements.length > 0 ? [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: 'Achievements:',
                      bold: true,
                      size: 24,
                    }),
                  ],
                }),
                ...exp.achievements.map(achievement => new Paragraph({
                  children: [
                    new TextRun({
                      text: `• ${achievement}`,
                      size: 22,
                    }),
                  ],
                })),
              ] : []),
              ...(exp.technologies && exp.technologies.length > 0 ? [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `Technologies: ${exp.technologies.join(', ')}`,
                      size: 22,
                    }),
                  ],
                }),
              ] : []),
              ...(exp.subProjects && exp.subProjects.length > 0 ? [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: 'Sub-Projects:',
                      bold: true,
                      size: 24,
                    }),
                  ],
                }),
                ...exp.subProjects.flatMap(sub => [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: `${sub.name} (${sub.role})`,
                        bold: true,
                        size: 22,
                      }),
                    ],
                  }),
                  ...(sub.responsibilities && sub.responsibilities.length > 0 ? sub.responsibilities.map(resp => new Paragraph({
                    children: [
                      new TextRun({
                        text: `  • ${resp}`,
                        size: 20,
                      }),
                    ],
                  })) : []),
                  ...(sub.techStack && sub.techStack.length > 0 ? [new Paragraph({
                    children: [
                      new TextRun({
                        text: `  Tech Stack: ${sub.techStack.join(', ')}`,
                        size: 20,
                      }),
                    ],
                  })] : []),
                ]),
              ] : []),
            ]),

            // Skills
            new Paragraph({
              children: [
                new TextRun({
                  text: 'SKILLS',
                  bold: true,
                  size: 28,
                }),
              ],
              heading: HeadingLevel.HEADING_2,
            }),
            ...(cvData.skills.technical && cvData.skills.technical.length > 0 ? [
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'Technical Skills:',
                    bold: true,
                    size: 24,
                  }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: cvData.skills.technical.join(', '),
                    size: 22,
                  }),
                ],
              }),
            ] : []),
            ...(cvData.skills.soft && cvData.skills.soft.length > 0 ? [
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'Soft Skills:',
                    bold: true,
                    size: 24,
                  }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: cvData.skills.soft.join(', '),
                    size: 22,
                  }),
                ],
              }),
            ] : []),
            ...(cvData.skills.languages && cvData.skills.languages.length > 0 ? [
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'Languages:',
                    bold: true,
                    size: 24,
                  }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: cvData.skills.languages.join(', '),
                    size: 22,
                  }),
                ],
              }),
            ] : []),
            ...(cvData.skills.tools && cvData.skills.tools.length > 0 ? [
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'Tools:',
                    bold: true,
                    size: 24,
                  }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: cvData.skills.tools.join(', '),
                    size: 22,
                  }),
                ],
              }),
            ] : []),

            // Education
            new Paragraph({
              children: [
                new TextRun({
                  text: 'EDUCATION',
                  bold: true,
                  size: 28,
                }),
              ],
              heading: HeadingLevel.HEADING_2,
            }),
            
            ...cvData.education.map(edu => 
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${edu.degree} - ${edu.school} (${edu.year})`,
                    size: 24,
                  }),
                ],
              })
            ),

            // Projects
            ...(cvData.projects && cvData.projects.length > 0 ? [
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'PROJECTS',
                    bold: true,
                    size: 28,
                  }),
                ],
                heading: HeadingLevel.HEADING_2,
              }),
              ...cvData.projects.flatMap(project => [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: project.name,
                      bold: true,
                      size: 26,
                    }),
                  ],
                }),
                ...(project.duration ? [new Paragraph({
                  children: [
                    new TextRun({
                      text: project.duration,
                      italics: true,
                      size: 22,
                    }),
                  ],
                })] : []),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: project.description,
                      size: 24,
                    }),
                  ],
                }),
                ...(project.techStack && project.techStack.length > 0 ? [new Paragraph({
                  children: [
                    new TextRun({
                      text: `Tech Stack: ${project.techStack.join(', ')}`,
                      size: 22,
                    }),
                  ],
                })] : []),
                ...(project.results ? [new Paragraph({
                  children: [
                    new TextRun({
                      text: `Results: ${project.results}`,
                      size: 22,
                    }),
                  ],
                })] : []),
                ...(project.link ? [new Paragraph({
                  children: [
                    new TextRun({
                      text: `Link: ${project.link}`,
                      size: 22,
                    }),
                  ],
                })] : []),
              ]),
            ] : []),

            // Certifications
            ...(cvData.certifications && cvData.certifications.length > 0 ? [
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'CERTIFICATIONS',
                    bold: true,
                    size: 28,
                  }),
                ],
                heading: HeadingLevel.HEADING_2,
              }),
              ...cvData.certifications.map(cert => 
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `${cert.name} - ${cert.issuer} (${cert.date})`,
                      size: 24,
                    }),
                  ],
                })
              ),
            ] : []),

            // Awards
            ...(cvData.awards && cvData.awards.length > 0 ? [
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'AWARDS',
                    bold: true,
                    size: 28,
                  }),
                ],
                heading: HeadingLevel.HEADING_2,
              }),
              ...cvData.awards.map(award => 
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `${award.name} - ${award.issuer} (${award.date})`,
                      size: 24,
                    }),
                  ],
                })
              ),
            ] : []),
          ],
        }],
      });

      const buffer = await Packer.toBuffer(doc);
      return buffer;
    } catch (error) {
      this.logger.error('Error generating Word document:', error);
      throw new Error('Failed to generate Word document');
    }
  }

  async exportToATS(cvData: CVData): Promise<Buffer> {
    try {
      // ATS-friendly format (plain text, no fancy formatting)
      const atsContent = this.formatForATS(cvData);
      return Buffer.from(atsContent, 'utf-8');
    } catch (error) {
      this.logger.error('Error generating ATS format:', error);
      throw new Error('Failed to generate ATS format');
    }
  }

  private generateHTML(cvData: CVData, template: string): string {
    const baseStyles = `
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          background: white; 
          color: #333; 
          line-height: 1.6;
        }
        .container { 
          max-width: 210mm; 
          margin: 0 auto; 
          background: white;
          box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        .header { 
          text-align: center; 
          padding: 40px 0 30px; 
          position: relative;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        }
        .header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #007bff, #28a745, #ffc107, #dc3545);
        }
        .header h1 { 
          font-size: 36px; 
          font-weight: 700; 
          color: #2c3e50; 
          margin-bottom: 8px;
          letter-spacing: 1px;
        }
        .header .title { 
          font-size: 18px; 
          color: #6c757d; 
          font-weight: 400;
          text-transform: uppercase;
          letter-spacing: 2px;
        }
        .main-content {
          display: flex;
          min-height: 800px;
        }
        .left-column {
          width: 35%;
          background: #f8f9fa;
          padding: 30px 25px;
          border-right: 1px solid #dee2e6;
        }
        .right-column {
          width: 65%;
          padding: 30px 35px;
        }
        .section { 
          margin-bottom: 30px; 
        }
        .section h2 { 
          font-size: 14px; 
          font-weight: 700; 
          color: #2c3e50; 
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 15px;
          padding: 8px 12px;
          background: #e9ecef;
          border-left: 4px solid #007bff;
        }
        .contact-item {
          display: flex;
          align-items: center;
          margin-bottom: 12px;
          font-size: 14px;
        }
        .contact-item .icon {
          width: 16px;
          height: 16px;
          margin-right: 10px;
          color: #007bff;
        }
        .education-item, .experience-item { 
          margin-bottom: 25px; 
        }
        .education-item h3, .experience-item h3 { 
          font-size: 16px; 
          font-weight: 600; 
          color: #2c3e50; 
          margin-bottom: 5px;
        }
        .education-item .school, .experience-item .company { 
          color: #6c757d; 
          font-size: 14px;
          font-weight: 500;
        }
        .education-item .year, .experience-item .duration { 
          color: #007bff; 
          font-size: 12px; 
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .skills-list {
          list-style: none;
        }
        .skills-list li {
          margin-bottom: 8px;
          font-size: 14px;
          color: #495057;
        }
        .skills-list li::before {
          content: '▶';
          color: #007bff;
          font-size: 10px;
          margin-right: 8px;
        }
        .summary {
          font-size: 15px;
          line-height: 1.7;
          color: #495057;
          text-align: justify;
        }
        .experience-item .responsibilities,
        .experience-item .achievements {
          margin-top: 10px;
        }
        .experience-item .responsibilities ul,
        .experience-item .achievements ul {
          margin-left: 20px;
          margin-top: 8px;
        }
        .experience-item .responsibilities li,
        .experience-item .achievements li {
          margin-bottom: 5px;
          font-size: 14px;
          color: #495057;
        }
        .tech-stack {
          margin-top: 10px;
          font-size: 13px;
          color: #6c757d;
          font-style: italic;
        }
        .sub-projects {
          margin-top: 15px;
          padding-left: 20px;
          border-left: 2px solid #e9ecef;
        }
        .sub-project {
          margin-bottom: 15px;
        }
        .sub-project h4 {
          font-size: 14px;
          font-weight: 600;
          color: #495057;
          margin-bottom: 5px;
        }
        .project-item, .cert-item {
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 1px solid #f1f3f4;
        }
        .project-item:last-child, .cert-item:last-child {
          border-bottom: none;
        }
        .project-item h3, .cert-item h3 {
          font-size: 16px;
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 5px;
        }
        .project-item .duration, .cert-item .date {
          color: #007bff;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .project-item .description {
          margin-top: 8px;
          font-size: 14px;
          color: #495057;
          line-height: 1.5;
        }
        .project-item .tech-stack {
          margin-top: 8px;
          font-size: 13px;
          color: #6c757d;
        }
        .cert-item .issuer {
          color: #6c757d;
          font-size: 14px;
          font-weight: 500;
        }
        .team-size {
          background: #e3f2fd;
          color: #1976d2;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          display: inline-block;
          margin-top: 5px;
        }
        .company-description {
          font-style: italic;
          color: #6c757d;
          font-size: 13px;
          margin-top: 5px;
        }
        @media print {
          .container { box-shadow: none; }
          .main-content { break-inside: avoid; }
        }
      </style>
    `;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${cvData.name} - CV</title>
        ${baseStyles}
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${cvData.name.toUpperCase()}</h1>
            <div class="title">${cvData.experience.length > 0 ? cvData.experience[0].title : 'PROFESSIONAL'}</div>
          </div>
          
          <div class="main-content">
            <!-- Left Column -->
            <div class="left-column">
              <!-- Contact -->
              <div class="section">
                <h2>CONTACT</h2>
                <div class="contact-item">
                  <span class="icon">📞</span>
                  <span>${cvData.phone}</span>
                </div>
                <div class="contact-item">
                  <span class="icon">✉️</span>
                  <span>${cvData.email}</span>
                </div>
                ${cvData.address ? `
                  <div class="contact-item">
                    <span class="icon">📍</span>
                    <span>${cvData.address}</span>
                  </div>
                ` : ''}
                ${cvData.linkedin ? `
                  <div class="contact-item">
                    <span class="icon">💼</span>
                    <span>${cvData.linkedin}</span>
                  </div>
                ` : ''}
              </div>
              
              <!-- Education -->
              <div class="section">
                <h2>EDUCATION</h2>
                ${cvData.education.map(edu => `
                  <div class="education-item">
                    <div class="year">${edu.year}</div>
                    <h3>${edu.school}</h3>
                    <div class="school">${edu.degree}</div>
                    ${edu.gpa ? `<div class="school">GPA: ${edu.gpa}</div>` : ''}
                    ${edu.honors ? `<div class="school">${edu.honors}</div>` : ''}
                  </div>
                `).join('')}
              </div>
              
              <!-- Skills -->
              <div class="section">
                <h2>SKILLS</h2>
                <ul class="skills-list">
                  ${cvData.skills.technical.map(skill => `<li>${skill}</li>`).join('')}
                  ${cvData.skills.soft.map(skill => `<li>${skill}</li>`).join('')}
                  ${cvData.skills.tools.map(skill => `<li>${skill}</li>`).join('')}
                </ul>
              </div>
              
              <!-- Languages -->
              ${cvData.skills.languages && cvData.skills.languages.length > 0 ? `
                <div class="section">
                  <h2>LANGUAGES</h2>
                  <ul class="skills-list">
                    ${cvData.skills.languages.map(lang => `<li>${lang}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}
            </div>
            
            <!-- Right Column -->
            <div class="right-column">
              <!-- Profile Summary -->
              ${cvData.summary ? `
                <div class="section">
                  <h2>PROFILE SUMMARY</h2>
                  <p class="summary">${cvData.summary}</p>
                </div>
              ` : ''}
              
              <!-- Work Experience -->
              <div class="section">
                <h2>WORK EXPERIENCE</h2>
                ${cvData.experience.map(exp => `
                  <div class="experience-item">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                      <div>
                        <h3>${exp.company}</h3>
                        <div class="company">${exp.title}</div>
                      </div>
                      <div class="duration">${exp.duration}</div>
                    </div>
                    ${exp.teamSize ? `<span class="team-size">👥 ${exp.teamSize}</span>` : ''}
                    ${exp.companyDescription ? `<div class="company-description">${exp.companyDescription}</div>` : ''}
                    ${exp.responsibilities && exp.responsibilities.length > 0 ? `
                      <div class="responsibilities">
                        <strong>Responsibilities:</strong>
                        <ul>
                          ${exp.responsibilities.map(responsibility => `<li>${responsibility}</li>`).join('')}
                        </ul>
                      </div>
                    ` : ''}
                    ${exp.achievements && exp.achievements.length > 0 ? `
                      <div class="achievements">
                        <strong>Achievements:</strong>
                        <ul>
                          ${exp.achievements.map(achievement => `<li>${achievement}</li>`).join('')}
                        </ul>
                      </div>
                    ` : ''}
                    ${exp.technologies && exp.technologies.length > 0 ? `
                      <div class="tech-stack">
                        <strong>Technologies:</strong> ${exp.technologies.join(', ')}
                      </div>
                    ` : ''}
                    ${exp.subProjects && exp.subProjects.length > 0 ? `
                      <div class="sub-projects">
                        <strong>Sub-Projects:</strong>
                        ${exp.subProjects.map(sub => `
                          <div class="sub-project">
                            <h4>${sub.name} (${sub.role})</h4>
                            ${sub.responsibilities && sub.responsibilities.length > 0 ? `
                              <ul>
                                ${sub.responsibilities.map(resp => `<li>${resp}</li>`).join('')}
                              </ul>
                            ` : ''}
                            ${sub.techStack && sub.techStack.length > 0 ? `
                              <div class="tech-stack">Tech Stack: ${sub.techStack.join(', ')}</div>
                            ` : ''}
                          </div>
                        `).join('')}
                      </div>
                    ` : ''}
                  </div>
                `).join('')}
              </div>
              
              <!-- Projects -->
              ${cvData.projects.length > 0 ? `
                <div class="section">
                  <h2>PROJECTS</h2>
                  ${cvData.projects.map(project => `
                    <div class="project-item">
                      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                        <h3>${project.name}</h3>
                        ${project.duration ? `<div class="duration">${project.duration}</div>` : ''}
                      </div>
                      <div class="description">${project.description}</div>
                      ${project.techStack && project.techStack.length > 0 ? `
                        <div class="tech-stack">Tech Stack: ${project.techStack.join(', ')}</div>
                      ` : ''}
                      ${project.results ? `<div class="description"><strong>Results:</strong> ${project.results}</div>` : ''}
                      ${project.link ? `<div class="description"><strong>Link:</strong> <a href="${project.link}">${project.link}</a></div>` : ''}
                    </div>
                  `).join('')}
                </div>
              ` : ''}
              
              <!-- Certifications -->
              ${cvData.certifications.length > 0 ? `
                <div class="section">
                  <h2>CERTIFICATIONS</h2>
                  ${cvData.certifications.map(cert => `
                    <div class="cert-item">
                      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                        <h3>${cert.name}</h3>
                        <div class="date">${cert.date}</div>
                      </div>
                      <div class="issuer">${cert.issuer}</div>
                      ${cert.link ? `<div class="description"><strong>Link:</strong> <a href="${cert.link}">${cert.link}</a></div>` : ''}
                    </div>
                  `).join('')}
                </div>
              ` : ''}
              
              <!-- Awards -->
              ${cvData.awards.length > 0 ? `
                <div class="section">
                  <h2>AWARDS</h2>
                  ${cvData.awards.map(award => `
                    <div class="cert-item">
                      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                        <h3>${award.name}</h3>
                        <div class="date">${award.date}</div>
                      </div>
                      <div class="issuer">${award.issuer}</div>
                    </div>
                  `).join('')}
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }


  private async generateReactPDFDocument(cvData: CVData, template: string): Promise<any> {
    // Dynamic import for ESM module
    const { Document, Page, Text, View, StyleSheet } = await import('@react-pdf/renderer');
    
    // Choose template
    if (template === 'two-column') {
      return this.generateTwoColumnTemplate(cvData);
    }
    
    // Default professional template
    
    const styles = StyleSheet.create({
      page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 30,
        fontSize: 12,
        lineHeight: 1.4,
      },
      header: {
        textAlign: 'center',
        marginBottom: 20,
      },
      name: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#2c3e50',
      },
      title: {
        fontSize: 14,
        color: '#6c757d',
        marginBottom: 10,
      },
      contact: {
        fontSize: 11,
        color: '#495057',
        marginBottom: 15,
      },
      section: {
        marginBottom: 15,
      },
      sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#2c3e50',
        borderBottom: '1px solid #dee2e6',
        paddingBottom: 3,
      },
      experienceItem: {
        marginBottom: 12,
      },
      jobTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#2c3e50',
      },
      company: {
        fontSize: 11,
        color: '#6c757d',
        marginBottom: 3,
      },
      duration: {
        fontSize: 10,
        color: '#007bff',
        fontStyle: 'italic',
        marginBottom: 5,
      },
      description: {
        fontSize: 10,
        color: '#495057',
        marginBottom: 3,
      },
      skillsList: {
        fontSize: 10,
        color: '#495057',
        marginBottom: 2,
      },
      educationItem: {
        marginBottom: 8,
      },
      degree: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#2c3e50',
      },
      school: {
        fontSize: 10,
        color: '#6c757d',
      },
      projectItem: {
        marginBottom: 10,
      },
      projectName: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#2c3e50',
      },
      projectDescription: {
        fontSize: 10,
        color: '#495057',
        marginBottom: 3,
      },
    });

    return React.createElement(Document, {},
      React.createElement(Page, { style: styles.page },
        // Header
        React.createElement(View, { style: styles.header },
          React.createElement(Text, { style: styles.name }, cvData.name.toUpperCase()),
          cvData.experience.length > 0 && React.createElement(Text, { style: styles.title }, cvData.experience[0].title),
          React.createElement(Text, { style: styles.contact }, `${cvData.email} | ${cvData.phone}`),
          cvData.address && React.createElement(Text, { style: styles.contact }, cvData.address),
          cvData.linkedin && React.createElement(Text, { style: styles.contact }, `LinkedIn: ${cvData.linkedin}`),
          cvData.dateOfBirth && React.createElement(Text, { style: styles.contact }, `Date of Birth: ${cvData.dateOfBirth}`)
        ),

        // Summary
        cvData.summary && React.createElement(View, { style: styles.section },
          React.createElement(Text, { style: styles.sectionTitle }, 'PROFILE SUMMARY'),
          React.createElement(Text, { style: styles.description }, cvData.summary)
        ),

        // Experience
        React.createElement(View, { style: styles.section },
          React.createElement(Text, { style: styles.sectionTitle }, 'WORK EXPERIENCE'),
          ...cvData.experience.map(exp => 
            React.createElement(View, { style: styles.experienceItem, key: `${exp.company}-${exp.title}` },
              React.createElement(Text, { style: styles.jobTitle }, `${exp.title} at ${exp.company}`),
              React.createElement(Text, { style: styles.duration }, exp.duration),
              exp.teamSize && React.createElement(Text, { style: styles.description }, `Team Size: ${exp.teamSize}`),
              exp.companyDescription && React.createElement(Text, { style: styles.description }, exp.companyDescription),
              exp.responsibilities && exp.responsibilities.length > 0 && 
                React.createElement(Text, { style: styles.description }, `Responsibilities: ${exp.responsibilities.join(', ')}`),
              exp.achievements && exp.achievements.length > 0 && 
                React.createElement(Text, { style: styles.description }, `Achievements: ${exp.achievements.join(', ')}`),
              exp.technologies && exp.technologies.length > 0 && 
                React.createElement(Text, { style: styles.description }, `Technologies: ${exp.technologies.join(', ')}`),
              exp.subProjects && exp.subProjects.length > 0 && 
                React.createElement(View, { style: { marginTop: 8 } },
                  React.createElement(Text, { style: { ...styles.description, fontWeight: 'bold' } }, 'Sub-Projects:'),
                  ...exp.subProjects.map(sub => 
                    React.createElement(View, { style: { marginLeft: 10, marginTop: 4 }, key: sub.name },
                      sub.name && React.createElement(Text, { style: styles.description }, `• ${sub.name}${sub.role ? ` (${sub.role})` : ''}`),
                      sub.responsibilities && sub.responsibilities.length > 0 && 
                        React.createElement(Text, { style: styles.description }, `  Responsibilities: ${sub.responsibilities.join(', ')}`),
                      sub.techStack && sub.techStack.length > 0 && 
                        React.createElement(Text, { style: styles.description }, `  Tech Stack: ${sub.techStack.join(', ')}`)
                    )
                  )
                )
            )
          )
        ),

        // Skills
        React.createElement(View, { style: styles.section },
          React.createElement(Text, { style: styles.sectionTitle }, 'SKILLS'),
          cvData.skills.technical && cvData.skills.technical.length > 0 && 
            React.createElement(Text, { style: styles.skillsList }, `Technical: ${cvData.skills.technical.join(', ')}`),
          cvData.skills.soft && cvData.skills.soft.length > 0 && 
            React.createElement(Text, { style: styles.skillsList }, `Soft Skills: ${cvData.skills.soft.join(', ')}`),
          cvData.skills.tools && cvData.skills.tools.length > 0 && 
            React.createElement(Text, { style: styles.skillsList }, `Tools: ${cvData.skills.tools.join(', ')}`),
          cvData.skills.languages && cvData.skills.languages.length > 0 && 
            React.createElement(Text, { style: styles.skillsList }, `Languages: ${cvData.skills.languages.join(', ')}`)
        ),

        // Education
        React.createElement(View, { style: styles.section },
          React.createElement(Text, { style: styles.sectionTitle }, 'EDUCATION'),
          ...cvData.education.map(edu => 
            React.createElement(View, { style: styles.educationItem, key: `${edu.school}-${edu.degree}` },
              React.createElement(Text, { style: styles.degree }, `${edu.degree} - ${edu.school}`),
              React.createElement(Text, { style: styles.school }, `Year: ${edu.year}`),
              edu.location && React.createElement(Text, { style: styles.school }, `Location: ${edu.location}`),
              edu.gpa && React.createElement(Text, { style: styles.school }, `GPA: ${edu.gpa}`),
              edu.honors && React.createElement(Text, { style: styles.school }, `Honors: ${edu.honors}`)
            )
          )
        ),

        // Projects
        cvData.projects && cvData.projects.length > 0 && React.createElement(View, { style: styles.section },
          React.createElement(Text, { style: styles.sectionTitle }, 'PROJECTS'),
          ...cvData.projects.map(project => 
            React.createElement(View, { style: styles.projectItem, key: project.name },
              React.createElement(Text, { style: styles.projectName }, project.name),
              project.duration && React.createElement(Text, { style: styles.duration }, project.duration),
              React.createElement(Text, { style: styles.projectDescription }, project.description),
              project.techStack && project.techStack.length > 0 && 
                React.createElement(Text, { style: styles.description }, `Tech Stack: ${project.techStack.join(', ')}`),
              project.results && React.createElement(Text, { style: styles.description }, `Results: ${project.results}`),
              project.link && React.createElement(Text, { style: styles.description }, `Link: ${project.link}`)
            )
          )
        ),

        // Certifications
        cvData.certifications && cvData.certifications.length > 0 && React.createElement(View, { style: styles.section },
          React.createElement(Text, { style: styles.sectionTitle }, 'CERTIFICATIONS'),
          ...cvData.certifications.map(cert => 
            React.createElement(View, { style: styles.educationItem, key: cert.name },
              React.createElement(Text, { style: styles.degree }, cert.name),
              React.createElement(Text, { style: styles.school }, `${cert.issuer} - ${cert.date}`),
              cert.link && React.createElement(Text, { style: styles.school }, `Link: ${cert.link}`)
            )
          )
        ),

        // Awards
        cvData.awards && cvData.awards.length > 0 && React.createElement(View, { style: styles.section },
          React.createElement(Text, { style: styles.sectionTitle }, 'AWARDS'),
          ...cvData.awards.map(award => 
            React.createElement(View, { style: styles.educationItem, key: award.name },
              React.createElement(Text, { style: styles.degree }, award.name),
              React.createElement(Text, { style: styles.school }, `${award.issuer} - ${award.date}`)
            )
          )
        ),

        // Publications
        cvData.publications && cvData.publications.length > 0 && React.createElement(View, { style: styles.section },
          React.createElement(Text, { style: styles.sectionTitle }, 'PUBLICATIONS'),
          ...cvData.publications.map(pub => 
            React.createElement(View, { style: styles.educationItem, key: pub.title },
              React.createElement(Text, { style: styles.degree }, pub.title),
              React.createElement(Text, { style: styles.school }, `${pub.journal} - ${pub.date}`),
              React.createElement(Text, { style: styles.school }, `Authors: ${pub.authors}`)
            )
          )
        ),

        // Volunteer Experience
        cvData.volunteer && cvData.volunteer.length > 0 && React.createElement(View, { style: styles.section },
          React.createElement(Text, { style: styles.sectionTitle }, 'VOLUNTEER EXPERIENCE'),
          ...cvData.volunteer.map(vol => 
            React.createElement(View, { style: styles.experienceItem, key: `${vol.organization}-${vol.role}` },
              React.createElement(Text, { style: styles.jobTitle }, `${vol.role} at ${vol.organization}`),
              React.createElement(Text, { style: styles.duration }, vol.duration),
              React.createElement(Text, { style: styles.description }, vol.description)
            )
          )
        )
      )
    );
  }

  private formatForATS(cvData: CVData): string {
    return `
${cvData.name}
${cvData.email} | ${cvData.phone}
${cvData.address || ''}
${cvData.linkedin ? `LinkedIn: ${cvData.linkedin}` : ''}
${cvData.dateOfBirth ? `Date of Birth: ${cvData.dateOfBirth}` : ''}

${cvData.summary ? `SUMMARY
${cvData.summary}

` : ''}EXPERIENCE
${cvData.experience.map(exp => {
  let result = `${exp.title} at ${exp.company} (${exp.duration})`;
  if (exp.teamSize) result += ` - Team Size: ${exp.teamSize}`;
  if (exp.companyDescription) result += `\nCompany: ${exp.companyDescription}`;
  if (exp.responsibilities && exp.responsibilities.length > 0) {
    result += `\nResponsibilities:\n${exp.responsibilities.map(resp => `- ${resp}`).join('\n')}`;
  }
  if (exp.achievements && exp.achievements.length > 0) {
    result += `\nAchievements:\n${exp.achievements.map(achievement => `- ${achievement}`).join('\n')}`;
  }
  if (exp.technologies && exp.technologies.length > 0) {
    result += `\nTechnologies: ${exp.technologies.join(', ')}`;
  }
  if (exp.subProjects && exp.subProjects.length > 0) {
    result += `\nSub-Projects:\n${exp.subProjects.map(sub => {
      let subResult = `${sub.name} (${sub.role})`;
      if (sub.responsibilities && sub.responsibilities.length > 0) {
        subResult += `\n  Responsibilities:\n  ${sub.responsibilities.map(resp => `- ${resp}`).join('\n  ')}`;
      }
      if (sub.techStack && sub.techStack.length > 0) {
        subResult += `\n  Tech Stack: ${sub.techStack.join(', ')}`;
      }
      return subResult;
    }).join('\n\n')}`;
  }
  return result;
}).join('\n\n')}

SKILLS
${cvData.skills.technical && cvData.skills.technical.length > 0 ? `Technical Skills: ${cvData.skills.technical.join(', ')}` : ''}
${cvData.skills.soft && cvData.skills.soft.length > 0 ? `Soft Skills: ${cvData.skills.soft.join(', ')}` : ''}
${cvData.skills.languages && cvData.skills.languages.length > 0 ? `Languages: ${cvData.skills.languages.join(', ')}` : ''}
${cvData.skills.tools && cvData.skills.tools.length > 0 ? `Tools: ${cvData.skills.tools.join(', ')}` : ''}

EDUCATION
${cvData.education.map(edu => {
  let result = `${edu.degree} - ${edu.school} (${edu.year})`;
  if (edu.location) result += ` - ${edu.location}`;
  if (edu.gpa) result += ` - GPA: ${edu.gpa}`;
  if (edu.honors) result += ` - Honors: ${edu.honors}`;
  return result;
}).join('\n')}

${cvData.projects.length > 0 ? `PROJECTS
${cvData.projects.map(project => {
  let result = `${project.name}`;
  if (project.duration) result += ` (${project.duration})`;
  result += `\n${project.description}`;
  if (project.techStack && project.techStack.length > 0) {
    result += `\nTech Stack: ${project.techStack.join(', ')}`;
  }
  if (project.results) {
    result += `\nResults: ${project.results}`;
  }
  if (project.link) {
    result += `\nLink: ${project.link}`;
  }
  return result;
}).join('\n\n')}` : ''}

${cvData.certifications.length > 0 ? `CERTIFICATIONS
${cvData.certifications.map(cert => {
  let result = `${cert.name} - ${cert.issuer} (${cert.date})`;
  if (cert.link) result += `\nLink: ${cert.link}`;
  return result;
}).join('\n')}` : ''}

${cvData.awards.length > 0 ? `AWARDS
${cvData.awards.map(award => 
  `${award.name} - ${award.issuer} (${award.date})`
).join('\n')}` : ''}

${cvData.publications.length > 0 ? `PUBLICATIONS
${cvData.publications.map(pub => 
  `${pub.title} - ${pub.journal} (${pub.date})
Authors: ${pub.authors}`
).join('\n\n')}` : ''}

${cvData.volunteer.length > 0 ? `VOLUNTEER EXPERIENCE
${cvData.volunteer.map(vol => 
  `${vol.role} at ${vol.organization} (${vol.duration})
${vol.description}`
).join('\n\n')}` : ''}
    `.trim();
  }

  private async generateTwoColumnTemplate(cvData: CVData): Promise<any> {
    const { Document, Page, Text, View, StyleSheet } = await import('@react-pdf/renderer');
    
    const styles = StyleSheet.create({
      page: {
        backgroundColor: '#FFFFFF',
        fontSize: 10,
        lineHeight: 1.4,
        padding: 0,
        margin: 0,
        flexDirection: 'row',
      },
      
      // Left Column (Dark Teal Background)
      leftColumn: {
        width: 240, // Fixed width in points
        backgroundColor: '#2c5f5f', // Dark teal
        padding: 30,
        color: '#FFFFFF',
        minHeight: 792, // A4 height
      },
      
      // Right Column (White Background)
      rightColumn: {
        width: 315, // Remaining width
        backgroundColor: '#FFFFFF',
        padding: 30,
        color: '#333333',
        minHeight: 792, // A4 height
      },
      
      // Profile Section
      profileSection: {
        marginBottom: 25,
        textAlign: 'center',
      },
      profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#FFFFFF',
        marginBottom: 15,
        alignSelf: 'center',
      },
      name: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#FFFFFF',
        textAlign: 'center',
      },
      title: {
        fontSize: 14,
        color: '#FFFFFF',
        textAlign: 'center',
        opacity: 0.9,
      },
      
      // Left Column Sections
      leftSection: {
        marginBottom: 25,
      },
      leftSectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#FFFFFF',
      },
      leftSectionText: {
        fontSize: 11,
        color: '#FFFFFF',
        marginBottom: 8,
        lineHeight: 1.4,
      },
      leftSectionLabel: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 3,
      },
      
      // Skills with Progress Bars
      skillItem: {
        marginBottom: 12,
      },
      skillName: {
        fontSize: 11,
        color: '#FFFFFF',
        marginBottom: 3,
      },
      progressBar: {
        height: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 2,
        overflow: 'hidden',
      },
      progressFill: {
        height: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 2,
      },
      
      // Right Column Sections
      rightSection: {
        marginBottom: 25,
      },
      rightSectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333333',
        borderBottom: '2px solid #2c5f5f',
        paddingBottom: 5,
      },
      rightSectionText: {
        fontSize: 11,
        color: '#333333',
        marginBottom: 8,
        lineHeight: 1.5,
      },
      
      // Experience Items
      experienceItem: {
        marginBottom: 15,
      },
      jobTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 2,
      },
      company: {
        fontSize: 11,
        color: '#2c5f5f',
        fontWeight: 'bold',
        marginBottom: 2,
      },
      duration: {
        fontSize: 10,
        color: '#666666',
        fontStyle: 'italic',
        marginBottom: 5,
      },
      responsibility: {
        fontSize: 10,
        color: '#333333',
        marginBottom: 2,
        marginLeft: 10,
      },
      
      // Education
      educationItem: {
        marginBottom: 10,
      },
      degree: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 2,
      },
      school: {
        fontSize: 11,
        color: '#2c5f5f',
        fontWeight: 'bold',
        marginBottom: 2,
      },
      educationDuration: {
        fontSize: 10,
        color: '#666666',
        fontStyle: 'italic',
      },
    });

    // Helper function to get skill level (0-1)
    const getSkillLevel = (skill: string): number => {
      // Simple mapping - in real app, this could be stored in CV data
      const skillLevels: { [key: string]: number } = {
        'JavaScript': 0.9,
        'TypeScript': 0.85,
        'React': 0.9,
        'Node.js': 0.8,
        'Python': 0.7,
        'Java': 0.6,
        'SQL': 0.75,
        'AWS': 0.6,
        'Docker': 0.5,
        'Git': 0.8,
      };
      return skillLevels[skill] || 0.5;
    };

    // Get primary skill categories
    const technicalSkills = cvData.skills?.technical || [];
    const softSkills = cvData.skills?.soft || [];
    const languages = cvData.skills?.languages || [];

    return React.createElement(Document, {},
      React.createElement(Page, { style: styles.page },
        
        // LEFT COLUMN
        React.createElement(View, { style: styles.leftColumn },
          
          // Profile Section
          React.createElement(View, { style: styles.profileSection },
            React.createElement(View, { style: styles.profileImage }),
            React.createElement(Text, { style: styles.name }, cvData.name.toUpperCase()),
            cvData.experience.length > 0 && 
              React.createElement(Text, { style: styles.title }, cvData.experience[0].title)
          ),
          
          // Contact Details
          React.createElement(View, { style: styles.leftSection },
            React.createElement(Text, { style: styles.leftSectionTitle }, 'DETAILS'),
            React.createElement(Text, { style: styles.leftSectionLabel }, 'Address'),
            React.createElement(Text, { style: styles.leftSectionText }, cvData.address || 'Not provided'),
            React.createElement(Text, { style: styles.leftSectionLabel }, 'Phone'),
            React.createElement(Text, { style: styles.leftSectionText }, cvData.phone),
            React.createElement(Text, { style: styles.leftSectionLabel }, 'Email'),
            React.createElement(Text, { style: styles.leftSectionText }, cvData.email),
          ),
          
          // Links
          cvData.linkedin && 
            React.createElement(View, { style: styles.leftSection },
              React.createElement(Text, { style: styles.leftSectionTitle }, 'LINKS'),
              React.createElement(Text, { style: styles.leftSectionText }, 'LinkedIn'),
            ),
          
          // Skills
          technicalSkills.length > 0 && 
            React.createElement(View, { style: styles.leftSection },
              React.createElement(Text, { style: styles.leftSectionTitle }, 'SKILLS'),
              ...technicalSkills.slice(0, 6).map(skill => 
                React.createElement(View, { style: styles.skillItem, key: skill },
                  React.createElement(Text, { style: styles.skillName }, skill),
                  React.createElement(View, { style: styles.progressBar },
                    React.createElement(View, { 
                      style: { 
                        ...styles.progressFill, 
                        width: `${getSkillLevel(skill) * 100}%` 
                      } 
                    })
                  )
                )
              )
            ),
        ),
        
        // RIGHT COLUMN
        React.createElement(View, { style: styles.rightColumn },
          
          // Profile Summary
          cvData.summary && 
            React.createElement(View, { style: styles.rightSection },
              React.createElement(Text, { style: styles.rightSectionTitle }, 'PROFILE'),
              React.createElement(Text, { style: styles.rightSectionText }, cvData.summary)
            ),
          
          // Experience
          React.createElement(View, { style: styles.rightSection },
            React.createElement(Text, { style: styles.rightSectionTitle }, 'EXPERIENCE'),
            ...cvData.experience.map(exp => 
              React.createElement(View, { style: styles.experienceItem, key: `${exp.company}-${exp.title}` },
                React.createElement(Text, { style: styles.jobTitle }, exp.title),
                React.createElement(Text, { style: styles.company }, exp.company),
                React.createElement(Text, { style: styles.duration }, exp.duration),
                ...(exp.responsibilities && exp.responsibilities.length > 0 ? 
                  exp.responsibilities.map(resp => 
                    React.createElement(Text, { style: styles.responsibility, key: resp }, `• ${resp}`)
                  ) : []),
                ...(exp.achievements && exp.achievements.length > 0 ? 
                  exp.achievements.map(ach => 
                    React.createElement(Text, { style: styles.responsibility, key: ach }, `• ${ach}`)
                  ) : []),
              )
            )
          ),
          
          // Education
          cvData.education.length > 0 && 
            React.createElement(View, { style: styles.rightSection },
              React.createElement(Text, { style: styles.rightSectionTitle }, 'EDUCATION'),
              ...cvData.education.map(edu => 
                React.createElement(View, { style: styles.educationItem, key: `${edu.school}-${edu.degree}` },
                  React.createElement(Text, { style: styles.degree }, edu.degree),
                  React.createElement(Text, { style: styles.school }, edu.school),
                  React.createElement(Text, { style: styles.educationDuration }, 
                    `${edu.year}${edu.gpa ? ` | GPA: ${edu.gpa}` : ''}`
                  ),
                )
              )
            ),
          
          // Languages
          languages.length > 0 && 
            React.createElement(View, { style: styles.rightSection },
              React.createElement(Text, { style: styles.rightSectionTitle }, 'LANGUAGES'),
              ...languages.map(lang => 
                React.createElement(Text, { style: styles.rightSectionText, key: lang }, lang)
              )
            ),
        )
      )
    );
  }

  private async exportHtmlToPDF(cvData: CVData): Promise<Buffer> {
    try {
      this.logger.log('Generating HTML template for two-column layout...');
      
      // Generate HTML template
      const htmlContent = await this.htmlTemplateService.generateTwoColumnHtml(cvData);
      
      // Write HTML to temporary file
      const tempDir = os.tmpdir();
      const tempHtmlFile = path.join(tempDir, `cv-${Date.now()}.html`);
      const tempPdfFile = path.join(tempDir, `cv-${Date.now()}.pdf`);
      
      await fs.promises.writeFile(tempHtmlFile, htmlContent, 'utf8');
      
      // Convert HTML to PDF using puppeteer
      const puppeteer = await import('puppeteer');
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      await page.goto(`file://${tempHtmlFile}`, { waitUntil: 'networkidle0' });
      
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '0.5in',
          right: '0.5in',
          bottom: '0.5in',
          left: '0.5in'
        }
      });
      
      await browser.close();
      
      // Clean up temporary files
      try {
        await fs.promises.unlink(tempHtmlFile);
      } catch (error) {
        this.logger.warn('Failed to delete temporary HTML file:', error);
      }
      
      // Convert Uint8Array to Buffer
      const buffer = Buffer.from(pdfBuffer);
      
      this.logger.log(`HTML to PDF conversion successful, size: ${buffer.length} bytes`);
      return buffer;
      
    } catch (error) {
      this.logger.error('Error converting HTML to PDF:', error);
      throw new Error(`Failed to convert HTML to PDF: ${error.message}`);
    }
  }
}