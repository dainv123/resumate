import * as fs from 'fs';
import { CVData } from '../../modules/cv/entities/cv.entity';
import { ExportService } from './export.service';
import { HtmlTemplateService } from './html-template.service';

describe('ExportService two-column PDF temp files', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('gives concurrent two-column exports distinct temp files', async () => {
    const writes: Array<{ file: string; html: string }> = [];
    jest.spyOn(Date, 'now').mockReturnValue(1_700_000_000_000);
    jest.spyOn(fs.promises, 'writeFile').mockImplementation(async (file, data) => {
      writes.push({ file: String(file), html: String(data) });
    });
    jest.spyOn(fs.promises, 'unlink').mockResolvedValue(undefined);

    const htmlTemplateService = {
      generateTwoColumnHtml: jest.fn(async (cvData: CVData) => `<html>${cvData.name}</html>`),
    } as unknown as HtmlTemplateService;
    const service = new ExportService(htmlTemplateService);

    await Promise.allSettled([
      service.exportToPDF({ name: 'Alice Applicant' } as CVData, 'two-column'),
      service.exportToPDF({ name: 'Bob Applicant' } as CVData, 'two-column'),
    ]);

    expect(writes).toHaveLength(2);
    expect(new Set(writes.map((write) => write.file)).size).toBe(2);
    expect(writes.map((write) => write.html).sort()).toEqual([
      '<html>Alice Applicant</html>',
      '<html>Bob Applicant</html>',
    ]);
  });
});
