import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { lookup } from 'dns/promises';
import { JobDescriptionSourceType } from '../constants/interview-prep.constants';
import { JdUrlResolverService } from './jd-url-resolver.service';

jest.mock('dns/promises', () => ({
  lookup: jest.fn(),
}));

const lookupMock = lookup as jest.MockedFunction<typeof lookup>;

function htmlResponse(body: string, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => body,
    json: async () => ({}),
    headers: { get: () => null },
  } as unknown as Response;
}

describe('JdUrlResolverService', () => {
  let service: JdUrlResolverService;

  beforeEach(async () => {
    lookupMock.mockResolvedValue([
      { address: '8.8.8.8', family: 4 },
    ] as unknown as Awaited<ReturnType<typeof lookup>>);

    const module: TestingModule = await Test.createTestingModule({
      providers: [JdUrlResolverService],
    }).compile();

    service = module.get(JdUrlResolverService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    lookupMock.mockReset();
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
      status: 200,
      json: async () => ({
        title: 'Senior Engineer',
        company_name: 'Acme',
        content: '<p>Build great software</p>',
        location: { name: 'Remote' },
      }),
      headers: { get: () => null },
    } as unknown as Response);

    const result = await service.resolve(
      'https://boards.greenhouse.io/acme/jobs/123',
    );

    expect(result.title).toBe('Senior Engineer');
    expect(result.company).toBe('Acme');
    expect(result.description).toContain('Build great software');
    expect(fetchMock).toHaveBeenCalledWith(
      'https://boards-api.greenhouse.io/v1/boards/acme/jobs/123',
      expect.objectContaining({ redirect: 'manual' }),
    );
  });

  it('rejects loopback, link-local, and private job URLs before fetching', async () => {
    const fetchMock = jest.spyOn(global, 'fetch');
    const blocked = [
      'http://169.254.169.254/latest/meta-data/',
      'http://127.0.0.1:5001/api/health',
      'http://localhost/secret',
      'http://10.0.0.5/',
      'http://192.168.1.10/',
      'http://172.16.0.2/',
      'http://[::1]/',
      'http://2130706433/',
      'http://user:pass@jobs.example.com/role',
    ];

    for (const url of blocked) {
      await expect(service.resolve(url)).rejects.toThrow(
        'Job posting URL is not allowed',
      );
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects a hostname that resolves to a private address', async () => {
    lookupMock.mockResolvedValue([
      { address: '172.18.0.2', family: 4 },
    ] as unknown as Awaited<ReturnType<typeof lookup>>);
    const fetchMock = jest.spyOn(global, 'fetch');

    await expect(service.resolve('http://postgres:5432/')).rejects.toThrow(
      'Job posting URL is not allowed',
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('does not follow a redirect onto a link-local address', async () => {
    const fetchMock = jest
      .spyOn(global, 'fetch')
      .mockImplementation(async (input) => {
        const target = String(input);
        if (target.includes('169.254.169.254')) {
          throw new Error('fetched metadata address');
        }
        return {
          ok: false,
          status: 302,
          text: async () => '',
          headers: {
            get: (name: string) =>
              name.toLowerCase() === 'location'
                ? 'http://169.254.169.254/latest/meta-data/'
                : null,
          },
        } as unknown as Response;
      });

    await expect(
      service.resolve('https://jobs.example.com/role/1'),
    ).rejects.toThrow('Job posting URL is not allowed');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('reads a public html job page without following redirects automatically', async () => {
    const fetchMock = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(
        htmlResponse(
          '<html><head><meta property="og:title" content="Backend Engineer"></head><body><article>We build APIs</article></body></html>',
        ),
      );

    const result = await service.resolve('https://jobs.example.com/role/1');

    expect(result.title).toBe('Backend Engineer');
    expect(result.description).toContain('We build APIs');
    expect(fetchMock).toHaveBeenCalledWith(
      'https://jobs.example.com/role/1',
      expect.objectContaining({ redirect: 'manual' }),
    );
  });
});
