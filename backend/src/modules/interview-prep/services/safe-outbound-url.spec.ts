import { BadRequestException } from '@nestjs/common';
import { lookup } from 'dns/promises';
import { assertPublicHttpUrl } from './safe-outbound-url';

jest.mock('dns/promises', () => ({
  lookup: jest.fn(),
}));

const lookupMock = lookup as unknown as jest.Mock;

describe('assertPublicHttpUrl', () => {
  afterEach(() => {
    lookupMock.mockReset();
  });

  it.each([
    'http://127.0.0.1/latest/meta-data/',
    'http://169.254.169.254/latest/meta-data/iam/security-credentials/',
    'http://10.1.2.3/',
    'http://192.168.1.10/',
    'http://2130706433/',
    'http://[::1]/',
    'http://localhost/admin',
    'http://metadata.google.internal/computeMetadata/v1/',
    'http://user:pass@example.com/',
    'http://example.com:6379/',
    'file:///etc/passwd',
  ])('rejects %s', async (input) => {
    await expect(assertPublicHttpUrl(input)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('allows a public https URL', async () => {
    lookupMock.mockResolvedValue([{ address: '93.184.216.34', family: 4 }]);

    const url = await assertPublicHttpUrl('https://example.com/jobs/1');
    expect(url.hostname).toBe('example.com');
  });
});
