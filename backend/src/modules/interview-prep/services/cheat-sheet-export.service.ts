import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { PlanStarStory } from '../domain/interview-prep-ai.types';
import { ProjectDefenseSheet } from '../domain/interview-prep-ai.types';
import { PrepDay } from '../domain/pass-framework';

export interface CheatSheetExportData {
  interviewDate: string;
  readinessScore: number;
  starStories: PlanStarStory[];
  projectDefenses: ProjectDefenseSheet[];
  questions: Array<{ priority: string; text: string }>;
  roadmap: PrepDay[];
}

@Injectable()
export class CheatSheetExportService {
  private readonly logger = new Logger(CheatSheetExportService.name);

  buildHtml(data: CheatSheetExportData): string {
    const starSection = data.starStories
      .map(
        (s, i) => `
        <div class="card">
          <h3>${i + 1}. ${escapeHtml(s.question)}</h3>
          <p><strong>S:</strong> ${escapeHtml(s.situation)}</p>
          <p><strong>T:</strong> ${escapeHtml(s.task)}</p>
          <p><strong>A:</strong> ${escapeHtml(s.action)}</p>
          <p><strong>R:</strong> ${escapeHtml(s.result)}</p>
        </div>`,
      )
      .join('');

    const questionSection = data.questions
      .map(
        (q) =>
          `<li><span class="badge">${escapeHtml(q.priority)}</span> ${escapeHtml(q.text)}</li>`,
      )
      .join('');

    const defenseSection = data.projectDefenses
      .map(
        (d) => `
        <div class="card">
          <h3>${escapeHtml(d.projectName)}</h3>
          <p><strong>Role:</strong> ${escapeHtml(d.role)}</p>
          <p><strong>Hardest problem:</strong> ${escapeHtml(d.hardestProblem)}</p>
          <p><strong>Outcome:</strong> ${escapeHtml(d.outcome)}</p>
        </div>`,
      )
      .join('');

    const upcomingDays = data.roadmap
      .filter((d) => d.daysUntilInterview <= 3)
      .map(
        (d) => `
        <div class="card">
          <h3>D-${d.daysUntilInterview} · ${escapeHtml(d.theme)}</h3>
          <ul>${d.tasks.map((t) => `<li>${t.done ? '✓' : '○'} ${escapeHtml(t.title)}</li>`).join('')}</ul>
        </div>`,
      )
      .join('');

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Interview Cheat Sheet</title>
  <style>
    body { font-family: system-ui, sans-serif; font-size: 11px; color: #111; line-height: 1.45; }
    h1 { font-size: 20px; margin-bottom: 4px; }
    h2 { font-size: 14px; margin: 20px 0 8px; border-bottom: 2px solid #2563eb; padding-bottom: 4px; }
    h3 { font-size: 12px; margin: 0 0 6px; }
    .meta { color: #555; margin-bottom: 16px; }
    .card { border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px; margin-bottom: 8px; }
    ul { margin: 0; padding-left: 18px; }
    .badge { background: #dbeafe; color: #1d4ed8; padding: 1px 6px; border-radius: 4px; font-size: 10px; }
  </style>
</head>
<body>
  <h1>Interview Cheat Sheet</h1>
  <p class="meta">Interview: ${escapeHtml(data.interviewDate)} · Readiness: ${data.readinessScore}/100</p>

  <h2>STAR Stories</h2>
  ${starSection || '<p>No STAR stories yet.</p>'}

  <h2>Key Questions</h2>
  <ul>${questionSection || '<li>No questions assigned.</li>'}</ul>

  <h2>Project Defense</h2>
  ${defenseSection || '<p>No project defense sheets.</p>'}

  <h2>Final Days Roadmap</h2>
  ${upcomingDays || '<p>No upcoming days.</p>'}
</body>
</html>`;
  }

  async exportToPdf(data: CheatSheetExportData): Promise<Buffer> {
    const htmlContent = this.buildHtml(data);
    const tempDir = os.tmpdir();
    const tempHtmlFile = path.join(tempDir, `cheat-sheet-${Date.now()}.html`);

    await fs.promises.writeFile(tempHtmlFile, htmlContent, 'utf8');

    const puppeteer = await import('puppeteer');
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.goto(`file://${tempHtmlFile}`, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0.5in', right: '0.5in', bottom: '0.5in', left: '0.5in' },
    });

    await browser.close();

    try {
      await fs.promises.unlink(tempHtmlFile);
    } catch (error) {
      this.logger.warn('Failed to delete temp HTML file', error);
    }

    return Buffer.from(pdfBuffer);
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
