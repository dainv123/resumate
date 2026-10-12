import { ConfigService } from '@nestjs/config';
import { GoogleAIService } from './google-ai.service';

jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({}),
  })),
}));

describe('GoogleAIService.tailorCvContent', () => {
  const configService = {
    get: (key: string) => {
      if (key === 'GOOGLE_AI_API_KEY') return 'test-key';
      if (key === 'GOOGLE_AI_MODEL') return 'gemini-test';
      return undefined;
    },
  } as unknown as ConfigService;

  function serviceWithResponse(payload: unknown): GoogleAIService {
    const service = new GoogleAIService(configService);
    (service as unknown as { model: { generateContent: jest.Mock } }).model = {
      generateContent: jest.fn().mockResolvedValue({
        response: {
          text: () => JSON.stringify(payload),
        },
      }),
    };
    return service;
  }

  it('keeps tailored experience and fills sections the model left out', async () => {
    const service = serviceWithResponse({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      experience: [
        {
          title: 'Engineer',
          company: 'Analytical Engines',
          duration: '1843',
        },
      ],
    });

    const tailored = await service.tailorCvContent(
      { name: 'Ada Lovelace' },
      'Need an engineer',
    );

    expect(tailored.name).toBe('Ada Lovelace');
    expect(tailored.experience[0].title).toBe('Engineer');
    expect(tailored.projects).toEqual([]);
    expect(tailored.education).toEqual([]);
    expect(tailored.skills.technical).toEqual([]);
  });

  it('does not return a resume that crashes preview when experience is omitted', async () => {
    const service = serviceWithResponse({
      name: 'Ada Lovelace',
      summary: 'Mathematician',
    });

    const tailored = await service.tailorCvContent({}, 'Need an engineer');

    expect(tailored.experience).toEqual([]);
    expect(tailored.projects).toEqual([]);
    expect(() => tailored.experience.length).not.toThrow();
  });
});
