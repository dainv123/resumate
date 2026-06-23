import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JobDescriptionSourceType } from '../constants/interview-prep.constants';
import { JdUrlResolverService } from './jd-url-resolver.service';

describe('JdUrlResolverService', () => {
  let service: JdUrlResolverService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JdUrlResolverService],
    }).compile();

    service = module.get(JdUrlResolverService);
  });

  it('detects URL input', () => {
    expect(service.isUrl('https://boards.greenhouse.io/acme/jobs/1')).toBe(true);
    expect(service.isUrl('Senior engineer role')).toBe(false);
  });

  it('detects greenhouse source type', () => {
    const type = service.detectSourceType(
      new URL('https://boards.greenhouse.io/acme/jobs/123'),
    );
    expect(type).toBe(JobDescriptionSourceType.GREENHOUSE);
  });

  it('rejects invalid URL', async () => {
    await expect(service.resolve('not-a-url')).rejects.toThrow(BadRequestException);
  });

  it('resolves greenhouse via public API', async () => {
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        title: 'Senior Engineer',
        company_name: 'Acme',
        content: '<p>Build great software</p>',
        location: { name: 'Remote' },
      }),
    } as Response);

    const result = await service.resolve(
      'https://boards.greenhouse.io/acme/jobs/123',
    );

    expect(result.title).toBe('Senior Engineer');
    expect(result.company).toBe('Acme');
    expect(result.description).toContain('Build great software');
    fetchMock.mockRestore();
  });
});
