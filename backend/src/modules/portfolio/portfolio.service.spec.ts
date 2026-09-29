import * as fs from 'fs';
import * as path from 'path';
import { PortfolioService } from './portfolio.service';
import { PortfolioData, PortfolioTemplate } from './dto/portfolio.dto';

describe('PortfolioService HTML rendering', () => {
  const portfolioData: PortfolioData = {
    user: {
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      bio: 'Engineer',
      avatar: '',
      linkedinUrl: 'https://linkedin.com/in/ada',
      githubUrl: '',
      websiteUrl: '',
    },
    cv: {
      summary: 'Built the first program',
      skills: {
        technical: ['TypeScript', 'React'],
        soft: ['Leadership'],
        languages: ['English'],
        tools: ['Git'],
      },
      experience: [
        {
          title: 'Senior Engineer',
          company: 'Analytical Engines',
          duration: '2020 - Present',
          responsibilities: ['Designed the compiler', 'Led a team of 4'],
          achievements: ['Shipped the analytical engine'],
        },
      ],
      education: [],
    },
    projects: [
      {
        name: 'Difference Engine',
        description: 'Mechanical calculator',
        techStack: ['Cogs', 'Brass'],
      },
    ],
    template: PortfolioTemplate.BASIC,
  };

  function serviceFor(templateFile: string): PortfolioService {
    const templateHtml = fs.readFileSync(
      path.join(__dirname, 'templates', templateFile),
      'utf8',
    );

    return new PortfolioService(
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      { loadTemplate: async () => templateHtml } as never,
    );
  }

  async function render(templateFile: string, template: PortfolioTemplate): Promise<string> {
    const service = serviceFor(templateFile);
    return service.generatePortfolioHTML({ ...portfolioData, template });
  }

  it('renders CV job titles, responsibilities, and skills for the basic template', async () => {
    const html = await render('basic.template.html', PortfolioTemplate.BASIC);

    expect(html).toContain('Senior Engineer');
    expect(html).toContain('Analytical Engines');
    expect(html).toContain('Designed the compiler');
    expect(html).toContain('Shipped the analytical engine');
    expect(html).toContain('TypeScript');
    expect(html).toContain('Leadership');
    expect(html).toContain('Git');
    expect(html).not.toContain('No description available');
    expect(html).not.toContain('<h3>Position</h3>');
    expect(html).not.toContain('<span class="skill"></span>');
  });

  it('renders the same CV fields for the modern and creative templates', async () => {
    const modern = await render('modern.template.html', PortfolioTemplate.MODERN);
    const creative = await render('creative.template.html', PortfolioTemplate.CREATIVE);

    expect(modern).toContain('Senior Engineer');
    expect(modern).toContain('Designed the compiler');
    expect(modern).toContain('TypeScript');
    expect(creative).toContain('TypeScript');
    expect(creative).toContain('Leadership');
    expect(modern).not.toContain('<h3>Position</h3>');
    expect(creative).not.toContain('<span class="skill"></span>');
  });

  it('renders job titles on the muhammad-ismail template and escapes HTML in CV text', async () => {
    const service = serviceFor('muhammad-ismail.template.html');
    const html = await service.generatePortfolioHTML({
      ...portfolioData,
      template: PortfolioTemplate.MUHAMMAD_ISMAIL,
      cv: {
        ...portfolioData.cv,
        experience: [
          {
            title: 'Senior <Engineer>',
            company: 'Analytical & Engines',
            duration: '2020 - Present',
            responsibilities: ['Designed <script>alert(1)</script>'],
          },
        ],
      },
    });

    expect(html).toContain('Senior &lt;Engineer&gt;');
    expect(html).toContain('Analytical &amp; Engines');
    expect(html).toContain('Designed &lt;script&gt;alert(1)&lt;/script&gt;');
    expect(html).not.toContain('<h3>Position</h3>');
    expect(html).toContain('TypeScript');
  });
});
