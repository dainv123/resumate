import { readFileSync } from 'fs';
import { join } from 'path';
import { cvPdfPrintOptions } from './cv-pdf-print-options';

describe('cvPdfPrintOptions', () => {
  it('includes every page so later resume sections are not dropped', () => {
    const options = cvPdfPrintOptions();

    expect(options.format).toBe('A4');
    expect(options.printBackground).toBe(true);
    expect(options).not.toHaveProperty('pageRanges');
  });

  it('is what the Puppeteer CV export prints', () => {
    const source = readFileSync(join(__dirname, 'export.service.ts'), 'utf8');
    const start = source.indexOf('private async generatePDFFromPage');
    const end = source.indexOf('private async handlePDFGenerationError');
    const body = source.slice(start, end);

    expect(body).toContain('cvPdfPrintOptions()');
    expect(body).not.toContain('pageRanges');
  });
});
