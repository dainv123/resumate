import { ConfigService } from '@nestjs/config';
import { GoogleStrategy } from './google.strategy';

describe('GoogleStrategy', () => {
  const configService = {
    get: (key: string) => {
      if (key === 'GOOGLE_CLIENT_ID') return 'test-client-id';
      if (key === 'GOOGLE_CLIENT_SECRET') return 'test-client-secret';
      return undefined;
    },
  } as unknown as ConfigService;

  const strategy = new GoogleStrategy(configService);

  function validate(profile: {
    id?: string;
    name?: { givenName?: string; familyName?: string };
    emails?: Array<{ value?: string }>;
    photos?: Array<{ value?: string }>;
  }) {
    return new Promise<Record<string, unknown>>((resolve, reject) => {
      strategy
        .validate('access-token', 'refresh-token', profile, (err, user) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(user as Record<string, unknown>);
        })
        .catch(reject);
    });
  }

  it('signs in a Google account that has no profile photo', async () => {
    const user = await validate({
      id: 'google-sub-ada',
      name: { givenName: 'Ada', familyName: 'Lovelace' },
      emails: [{ value: 'ada@example.com' }],
    });

    expect(user).toEqual({
      googleId: 'google-sub-ada',
      email: 'ada@example.com',
      name: 'Ada Lovelace',
      avatar: undefined,
      accessToken: 'access-token',
    });
  });

  it('uses the email when Google omits a display name', async () => {
    const user = await validate({
      id: 'google-sub-mononym',
      emails: [{ value: 'mononym@example.com' }],
      photos: [{ value: 'https://example.com/photo.png' }],
    });

    expect(user.name).toBe('mononym@example.com');
    expect(user.avatar).toBe('https://example.com/photo.png');
  });

  it('rejects a profile that has no email', async () => {
    await expect(
      validate({
        id: 'google-sub-no-email',
        name: { givenName: 'No', familyName: 'Email' },
      }),
    ).rejects.toThrow('Google account did not return an id and email');
  });
});
