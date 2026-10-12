import { ExportService } from './export.service';
import { HtmlTemplateService } from './html-template.service';
import { CVData } from '../../modules/cv/entities/cv.entity';

describe('ExportService missing sections', () => {
  const service = new ExportService({} as HtmlTemplateService);

  const partialResume = {
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    phone: '1',
  } as CVData;

  it('exports ATS text when list sections were omitted', async () => {
    const buffer = await service.exportToATS(partialResume);

    expect(buffer.toString('utf-8')).toContain('Ada Lovelace');
    expect(buffer.toString('utf-8')).toContain('EXPERIENCE');
  });

  it('exports a Word document when list sections were omitted', async () => {
    const buffer = await service.exportToWord(partialResume);

    expect(buffer.length).toBeGreaterThan(0);
  });
});
