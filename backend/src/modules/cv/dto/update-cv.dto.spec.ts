import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { UpdateCvDto } from './cv.dto';

async function validateUpdate(body: Record<string, unknown>) {
  const dto = plainToInstance(UpdateCvDto, body);
  return validate(dto, {
    whitelist: true,
    forbidNonWhitelisted: true,
  });
}

describe('UpdateCvDto', () => {
  const parsedData = {
    contact: { name: 'Ada Lovelace' },
    summary: 'Engineer',
  };

  it('accepts a content-only update', async () => {
    const errors = await validateUpdate({ parsedData });
    expect(errors).toHaveLength(0);
  });

  it('rejects editor payloads that include server-owned fields', async () => {
    const errors = await validateUpdate({
      parsedData,
      version: 3,
      isTailored: true,
      tailoredForJob: 'Staff engineer',
      improvementNotes: {
        parsingImprovements: [],
        templateEnhancements: [],
        dataCompleteness: [],
        lastUpdated: '2026-11-11T00:00:00.000Z',
      },
    });

    const messages = errors.flatMap((error) =>
      Object.values(error.constraints ?? {}),
    );
    expect(messages).toEqual(
      expect.arrayContaining([
        'property version should not exist',
        'property improvementNotes should not exist',
      ]),
    );
  });
});
