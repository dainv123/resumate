import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CvService } from '../cv/cv.service';
import { ProjectsService } from '../projects/projects.service';
import { CreatePortfolioDto, UpdatePortfolioDto, PortfolioData, PortfolioTemplate } from './dto/portfolio.dto';

@Injectable()
export class PortfolioService {
  constructor(
    private usersService: UsersService,
    private cvService: CvService,
    private projectsService: ProjectsService,
  ) {}

  async generatePortfolio(userId: string, createPortfolioDto: CreatePortfolioDto): Promise<PortfolioData> {
    // Get user data
    const user = await this.usersService.findById(userId);
    
    // Get latest CV
    const cvs = await this.cvService.getUserCvs(userId);
    const latestCv = cvs[0];

    // Get projects
    const projects = await this.projectsService.getProjectsForPortfolio(userId);

    return {
      user: {
        name: user.name,
        email: user.email,
        avatar: user.avatar || createPortfolioDto.avatar,
        bio: createPortfolioDto.bio,
        linkedinUrl: createPortfolioDto.linkedinUrl,
        githubUrl: createPortfolioDto.githubUrl,
        websiteUrl: createPortfolioDto.websiteUrl,
      },
      cv: {
        summary: latestCv?.parsedData.summary,
        skills: latestCv?.parsedData.skills || {
          technical: [],
          soft: [],
          languages: [],
          tools: []
        },
        experience: latestCv?.parsedData.experience || [],
        education: latestCv?.parsedData.education || [],
      },
      projects,
      template: createPortfolioDto.template,
      customDomain: createPortfolioDto.customDomain,
    };
  }

  async getPortfolioByUsername(username: string): Promise<PortfolioData> {
    // This would typically query a portfolio table
    // For now, we'll use a simple approach
    throw new NotFoundException('Portfolio not found');
  }

  async generatePortfolioHTML(portfolioData: PortfolioData): Promise<string> {
    const template = this.getTemplate(portfolioData.template);
    return this.renderTemplate(template, portfolioData);
  }

  async generatePortfolioUrl(userId: string, customDomain?: string): Promise<string> {
    const user = await this.usersService.findById(userId);
    const username = user.email.split('@')[0].toLowerCase();
    
    if (customDomain) {
      return `https://${customDomain}`;
    }
    
    return `https://${username}.resumate.app/portfolio`;
  }

  private getTemplate(template: PortfolioTemplate): string {
    const templates = {
      [PortfolioTemplate.BASIC]: this.getBasicTemplate(),
      [PortfolioTemplate.MODERN]: this.getModernTemplate(),
      [PortfolioTemplate.CREATIVE]: this.getCreativeTemplate(),
    };
    
    return templates[template];
  }

  private getBasicTemplate(): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{user.name}} - Portfolio</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { color: #333; margin: 0; }
        .header p { color: #666; margin: 10px 0; }
        .section { margin-bottom: 30px; }
        .section h2 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 5px; }
        .skills { display: flex; flex-wrap: wrap; gap: 10px; }
        .skill { background: #007bff; color: white; padding: 5px 10px; border-radius: 15px; font-size: 14px; }
        .project { margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .project h3 { margin: 0 0 10px 0; color: #333; }
        .project p { margin: 5px 0; color: #666; }
        .tech-stack { font-style: italic; color: #007bff; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{user.name}}</h1>
            <p>{{user.bio}}</p>
            <p>{{user.email}}</p>
        </div>
        
        <div class="section">
            <h2>Skills</h2>
            <div class="skills">
                {{#each cv.skills}}
                <span class="skill">{{this}}</span>
                {{/each}}
            </div>
        </div>
        
        <div class="section">
            <h2>Experience</h2>
            {{#each cv.experience}}
            <div class="project">
                <h3>{{role}} at {{company}}</h3>
                <p><strong>Duration:</strong> {{duration}}</p>
                <p>{{description}}</p>
            </div>
            {{/each}}
        </div>
        
        <div class="section">
            <h2>Projects</h2>
            {{#each projects}}
            <div class="project">
                <h3>{{name}}</h3>
                <p>{{description}}</p>
                <p class="tech-stack">Tech Stack: {{techStack}}</p>
                {{#if demoLink}}<p><a href="{{demoLink}}" target="_blank">Demo</a></p>{{/if}}
                {{#if githubLink}}<p><a href="{{githubLink}}" target="_blank">GitHub</a></p>{{/if}}
            </div>
            {{/each}}
        </div>
    </div>
</body>
</html>
    `;
  }

  private getModernTemplate(): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{user.name}} - Portfolio</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        .hero { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 80px 0; text-align: center; }
        .hero h1 { font-size: 3rem; margin-bottom: 20px; }
        .hero p { font-size: 1.2rem; opacity: 0.9; }
        .content { padding: 60px 0; }
        .section { margin-bottom: 60px; }
        .section h2 { font-size: 2rem; margin-bottom: 30px; color: #333; position: relative; }
        .section h2::after { content: ''; position: absolute; bottom: -10px; left: 0; width: 50px; height: 3px; background: #667eea; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; }
        .card { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); transition: transform 0.3s ease; }
        .card:hover { transform: translateY(-5px); }
        .skills { display: flex; flex-wrap: wrap; gap: 10px; }
        .skill { background: #667eea; color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; }
        .project h3 { color: #333; margin-bottom: 15px; }
        .project p { color: #666; margin-bottom: 10px; }
        .tech-stack { color: #667eea; font-weight: 500; }
    </style>
</head>
<body>
    <div class="hero">
        <div class="container">
            <h1>{{user.name}}</h1>
            <p>{{user.bio}}</p>
        </div>
    </div>
    
    <div class="content">
        <div class="container">
            <div class="section">
                <h2>Skills</h2>
                <div class="skills">
                    {{#each cv.skills}}
                    <span class="skill">{{this}}</span>
                    {{/each}}
                </div>
            </div>
            
            <div class="section">
                <h2>Experience</h2>
                <div class="grid">
                    {{#each cv.experience}}
                    <div class="card">
                        <h3>{{role}} at {{company}}</h3>
                        <p><strong>Duration:</strong> {{duration}}</p>
                        <p>{{description}}</p>
                    </div>
                    {{/each}}
                </div>
            </div>
            
            <div class="section">
                <h2>Projects</h2>
                <div class="grid">
                    {{#each projects}}
                    <div class="card">
                        <h3>{{name}}</h3>
                        <p>{{description}}</p>
                        <p class="tech-stack">Tech Stack: {{techStack}}</p>
                        {{#if demoLink}}<p><a href="{{demoLink}}" target="_blank">View Demo</a></p>{{/if}}
                        {{#if githubLink}}<p><a href="{{githubLink}}" target="_blank">View Code</a></p>{{/if}}
                    </div>
                    {{/each}}
                </div>
            </div>
        </div>
    </div>
</body>
</html>
    `;
  }

  private getCreativeTemplate(): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{user.name}} - Portfolio</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Arial', sans-serif; background: #0a0a0a; color: #fff; overflow-x: hidden; }
        .container { max-width: 1400px; margin: 0 auto; padding: 0 20px; }
        .hero { height: 100vh; display: flex; align-items: center; justify-content: center; text-align: center; position: relative; }
        .hero::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: radial-gradient(circle, rgba(255,0,150,0.3) 0%, rgba(0,0,0,0.8) 70%); }
        .hero-content { position: relative; z-index: 1; }
        .hero h1 { font-size: 4rem; margin-bottom: 20px; background: linear-gradient(45deg, #ff0096, #00ff88); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .hero p { font-size: 1.5rem; opacity: 0.8; }
        .content { padding: 100px 0; }
        .section { margin-bottom: 100px; }
        .section h2 { font-size: 3rem; margin-bottom: 50px; text-align: center; background: linear-gradient(45deg, #ff0096, #00ff88); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .skills { display: flex; flex-wrap: wrap; gap: 20px; justify-content: center; }
        .skill { background: linear-gradient(45deg, #ff0096, #00ff88); padding: 15px 30px; border-radius: 30px; font-size: 16px; font-weight: bold; transform: rotate(-2deg); transition: transform 0.3s ease; }
        .skill:hover { transform: rotate(0deg) scale(1.1); }
        .projects-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 40px; }
        .project { background: rgba(255,255,255,0.1); padding: 40px; border-radius: 20px; backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.2); transition: transform 0.3s ease; }
        .project:hover { transform: translateY(-10px); }
        .project h3 { font-size: 1.5rem; margin-bottom: 20px; color: #00ff88; }
        .project p { margin-bottom: 15px; opacity: 0.8; }
        .tech-stack { color: #ff0096; font-weight: bold; }
    </style>
</head>
<body>
    <div class="hero">
        <div class="container">
            <div class="hero-content">
                <h1>{{user.name}}</h1>
                <p>{{user.bio}}</p>
            </div>
        </div>
    </div>
    
    <div class="content">
        <div class="container">
            <div class="section">
                <h2>Skills</h2>
                <div class="skills">
                    {{#each cv.skills}}
                    <span class="skill">{{this}}</span>
                    {{/each}}
                </div>
            </div>
            
            <div class="section">
                <h2>Projects</h2>
                <div class="projects-grid">
                    {{#each projects}}
                    <div class="project">
                        <h3>{{name}}</h3>
                        <p>{{description}}</p>
                        <p class="tech-stack">Tech Stack: {{techStack}}</p>
                        {{#if demoLink}}<p><a href="{{demoLink}}" target="_blank" style="color: #00ff88;">View Demo</a></p>{{/if}}
                        {{#if githubLink}}<p><a href="{{githubLink}}" target="_blank" style="color: #ff0096;">View Code</a></p>{{/if}}
                    </div>
                    {{/each}}
                </div>
            </div>
        </div>
    </div>
</body>
</html>
    `;
  }

  private renderTemplate(template: string, data: PortfolioData): string {
    // Simple template rendering (in production, use a proper template engine like Handlebars)
    let html = template;
    
    // Replace user data
    html = html.replace(/\{\{user\.name\}\}/g, data.user.name || '');
    html = html.replace(/\{\{user\.bio\}\}/g, data.user.bio || '');
    html = html.replace(/\{\{user\.email\}\}/g, data.user.email || '');
    
    // Replace CV data
    html = html.replace(/\{\{cv\.summary\}\}/g, data.cv.summary || '');
    
    // Replace skills
    const allSkills = [
      ...(data.cv.skills.technical || []),
      ...(data.cv.skills.soft || []),
      ...(data.cv.skills.languages || []),
      ...(data.cv.skills.tools || [])
    ];
    const skillsHtml = allSkills.map(skill => `<span class="skill">${skill}</span>`).join('');
    html = html.replace(/\{\{#each cv\.skills\}\}[\s\S]*?\{\{\/each\}\}/g, skillsHtml);
    
    // Replace experience
    const experienceHtml = data.cv.experience.map(exp => `
      <div class="project">
        <h3>${exp.role} at ${exp.company}</h3>
        <p><strong>Duration:</strong> ${exp.duration}</p>
        <p>${exp.description}</p>
      </div>
    `).join('');
    html = html.replace(/\{\{#each cv\.experience\}\}[\s\S]*?\{\{\/each\}\}/g, experienceHtml);
    
    // Replace projects
    const projectsHtml = data.projects.map(project => `
      <div class="project">
        <h3>${project.name}</h3>
        <p>${project.description}</p>
        <p class="tech-stack">Tech Stack: ${project.techStack.join(', ')}</p>
        ${project.demoLink ? `<p><a href="${project.demoLink}" target="_blank">View Demo</a></p>` : ''}
        ${project.githubLink ? `<p><a href="${project.githubLink}" target="_blank">View Code</a></p>` : ''}
      </div>
    `).join('');
    html = html.replace(/\{\{#each projects\}\}[\s\S]*?\{\{\/each\}\}/g, projectsHtml);
    
    return html;
  }
}