import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID') || 'default-client-id',
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET') || 'default-client-secret',
      callbackURL: '/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: {
      id?: string;
      name?: { givenName?: string; familyName?: string };
      emails?: Array<{ value?: string }>;
      photos?: Array<{ value?: string }>;
    },
    done: VerifyCallback,
  ): Promise<void> {
    const email = profile.emails?.[0]?.value;
    if (!profile.id || !email) {
      done(new Error('Google account did not return an id and email'), undefined);
      return;
    }

    const givenName = profile.name?.givenName ?? '';
    const familyName = profile.name?.familyName ?? '';
    const name = `${givenName} ${familyName}`.trim() || email;

    done(null, {
      googleId: profile.id,
      email,
      name,
      avatar: profile.photos?.[0]?.value,
      accessToken,
    });
  }
}