import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { lookup } from 'dns/promises';
import { JobDescriptionSourceType } from '../constants/interview-prep.constants';
import { JdUrlResolverService } from './jd-url-resolver.service';

jest.mock('dns/promises', () => ({
  lookup: jest.fn(),
}));

const lookupMock = lookup as unknown as jest.Mock;

describe('JdUrlResolverService', () => {
  let service: JdUrlResolverService;

  beforeEach(async () => {
    lookupMock.mockReset();
    lookupMock.mockResolvedValue([{ address: '93.184.216.34', family: 4 }]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [JdUrlResolverService],
    }).compile();

    service = module.get(JdUrlResolverService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('detects URL input', () => {
    expect(service.isUrl('https://boards.greenhouse.io/acme/jobs/1')).toBe(
      true,
    );
    expect(service.isUrl('Senior engineer role')).toBe(false);
  });

  it('detects greenhouse source type', () => {
    const type = service.detectSourceType(
      new URL('https://boards.greenhouse.io/acme/jobs/123'),
    );
    expect(type).toBe(JobDescriptionSourceType.GREENHOUSE);
  });

  it('rejects invalid URL', async () => {
    await expect(service.resolve('not-a-url')).rejects.toThrow(
      BadRequestException,
    );
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

  it('rejects cloud metadata and loopback targets without fetching', async () => {
    const fetchMock = jest.spyOn(global, 'fetch');

    await expect(
      service.resolve('http://169.254.169.254/latest/meta-data/'),
    ).rejects.toThrow(BadRequestException);
    await expect(service.resolve('http://127.0.0.1/')).rejects.toThrow(
      BadRequestException,
    );
    await expect(service.resolve('http://[::ffff:127.0.0.1]/')).rejects.toThrow(
      BadRequestException,
    );

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects a public page that redirects to a private address', async () => {
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
      status: 302,
      ok: false,
      headers: new Headers({
        location: 'http://169.254.169.254/latest/meta-data/',
      }),
      body: { cancel: async () => undefined },
    } as unknown as Response);

    await expect(service.resolve('https://example.com/jobs/1')).rejects.toThrow(
      BadRequestException,
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('rejects a hostname that resolves to a private address', async () => {
    lookupMock.mockResolvedValue([{ address: '10.0.0.8', family: 4 }]);
    const fetchMock = jest.spyOn(global, 'fetch');

    await expect(
      service.resolve('https://jobs.internal.example/1'),
    ).rejects.toThrow(BadRequestException);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
