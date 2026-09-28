import { HtmlTemplateService } from './html-template.service';
import { CVData } from '../../modules/cv/entities/cv.entity';

function cvData(overrides: Partial<CVData> = {}): CVData {
  return {
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    phone: '555-0100',
    education: [],
    experience: [],
    skills: {
      technical: [],
      soft: [],
      languages: [],
      tools: [],
    },
    projects: [],
    certifications: [],
    awards: [],
    publications: [],
    volunteer: [],
    ...overrides,
  };
}

describe('HtmlTemplateService', () => {
  const service = new HtmlTemplateService();

  it('keeps certifications, awards, publications, and volunteer when the CV has no projects', async () => {
    const html = await service.generateTwoColumnHtml(
      cvData({
        certifications: [
          { name: 'AWS Certified', issuer: 'Amazon', date: '2024' },
        ],
        awards: [{ name: 'Employee of the Year', issuer: 'Acme', date: '2023' }],
        publications: [
          {
            title: 'Notes on the Analytical Engine',
            journal: 'Scientific Memoirs',
            date: '1843',
            authors: 'Ada Lovelace',
          },
        ],
        volunteer: [
          {
            role: 'Mentor',
            organization: 'Code Club',
            duration: '2022 - 2024',
            description: 'Taught weekly workshops',
          },
        ],
      }),
    );

    expect(html).toContain('AWS Certified');
    expect(html).toContain('Employee of the Year');
    expect(html).toContain('Notes on the Analytical Engine');
    expect(html).toContain('Taught weekly workshops');
    expect(html).not.toContain('<h3>Projects</h3>');
  });

  it('keeps tools when the CV has no soft skills', async () => {
    const html = await service.generateTwoColumnHtml(
      cvData({
        skills: {
          technical: ['TypeScript'],
          soft: [],
          languages: [],
          tools: ['Docker'],
        },
      }),
    );

    expect(html).toContain('TypeScript');
    expect(html).toContain('Docker');
    expect(html).not.toContain('Soft Skills');
  });

  it('still renders projects together with certifications', async () => {
    const html = await service.generateTwoColumnHtml(
      cvData({
        projects: [
          {
            name: 'Analytical Engine',
            description: 'First published computer program',
            techStack: ['Mathematics'],
          },
        ],
        certifications: [
          { name: 'AWS Certified', issuer: 'Amazon', date: '2024' },
        ],
      }),
    );

    expect(html).toContain('Analytical Engine');
    expect(html).toContain('AWS Certified');
  });
});
