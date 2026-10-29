import 'reflect-metadata';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { UpdateCvDto } from './dto/cv.dto';
import { CvService } from './cv.service';
import { Cv } from './entities/cv.entity';

describe('CV editor save', () => {
  const pipe = new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  });

  const editorPayload = {
    parsedData: {
      contact: { name: 'Ada Lovelace' },
      summary: 'Engineer',
      experience: [{ title: 'Mathematician', company: 'Analytical Engines' }],
      skills: { technical: ['Mathematics'], soft: [], languages: [], tools: [] },
      education: [],
      projects: [],
    },
    version: 4,
    isTailored: false,
    tailoredForJob: null,
    improvementNotes: {
      parsingImprovements: ['Kept the original summary'],
      templateEnhancements: [],
      dataCompleteness: [],
      lastUpdated: '2026-10-01T00:00:00.000Z',
    },
  };

  it('accepts the editor body and keeps nested CV sections', async () => {
    const dto = (await pipe.transform(editorPayload, {
      type: 'body',
      metatype: UpdateCvDto,
    })) as UpdateCvDto;

    expect(dto.parsedData?.contact?.name).toBe('Ada Lovelace');
    expect(dto.parsedData?.experience?.[0]?.title).toBe('Mathematician');
    expect(dto.parsedData?.skills?.technical).toEqual(['Mathematics']);
    expect(dto.version).toBe(4);
    expect(dto.improvementNotes).toEqual(editorPayload.improvementNotes);
  });

  it('still rejects fields that are not part of the update contract', async () => {
    await expect(
      pipe.transform(
        { ...editorPayload, userId: 'someone-else' },
        { type: 'body', metatype: UpdateCvDto },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('saves parsed data and ignores a client-supplied version and notes', async () => {
    const existingNotes = {
      parsingImprovements: ['original'],
      templateEnhancements: [],
      dataCompleteness: [],
      lastUpdated: '2026-01-01T00:00:00.000Z',
    };
    const cv = {
      id: 'cv-1',
      userId: 'user-1',
      originalFileName: 'ada.pdf',
      parsedData: { contact: { name: 'Old Name' } },
      version: 4,
      isTailored: true,
      tailoredForJob: 'Staff Engineer',
      improvementNotes: existingNotes,
      versionHistory: [],
    } as unknown as Cv;

    const saved: Cv[] = [];
    const cvRepository = {
      findOne: jest.fn().mockResolvedValue(cv),
      save: jest.fn().mockImplementation(async (entity: Cv) => {
        saved.push(entity);
        return entity;
      }),
    };

    const service = new CvService(
      cvRepository as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
    );

    const dto = (await pipe.transform(
      { ...editorPayload, version: 1 },
      { type: 'body', metatype: UpdateCvDto },
    )) as UpdateCvDto;

    const result = await service.updateCv('cv-1', 'user-1', dto);

    expect(dto.version).toBe(1);
    expect(result.parsedData.contact?.name).toBe('Ada Lovelace');
    expect(result.version).toBe(5);
    expect(result.improvementNotes).toEqual(existingNotes);
    expect(result.originalFileName).toBe('ada.pdf');
    expect(result.isTailored).toBe(false);
    expect(result.tailoredForJob).toBeNull();
    expect(result.versionHistory).toHaveLength(1);
    expect(result.versionHistory?.[0].version).toBe(4);
    expect(result.versionHistory?.[0].parsedData).toEqual({
      contact: { name: 'Old Name' },
    });
    expect(saved).toHaveLength(1);
  });

  it('renames a CV without clearing parsed data', async () => {
    const parsedData = { contact: { name: 'Ada Lovelace' } };
    const cv = {
      id: 'cv-1',
      userId: 'user-1',
      originalFileName: 'ada.pdf',
      parsedData,
      version: 2,
      isTailored: false,
      versionHistory: [],
    } as unknown as Cv;

    const cvRepository = {
      findOne: jest.fn().mockResolvedValue(cv),
      save: jest.fn().mockImplementation(async (entity: Cv) => entity),
    };

    const service = new CvService(
      cvRepository as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
    );

    const dto = (await pipe.transform(
      { originalFileName: 'ada-lovelace.pdf' },
      { type: 'body', metatype: UpdateCvDto },
    )) as UpdateCvDto;

    const result = await service.updateCv('cv-1', 'user-1', dto);

    expect(result.originalFileName).toBe('ada-lovelace.pdf');
    expect(result.parsedData).toBe(parsedData);
    expect(result.version).toBe(3);
  });
});
