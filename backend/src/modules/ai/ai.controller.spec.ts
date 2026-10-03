import { GUARDS_METADATA } from '@nestjs/common/constants';
import { AiController } from './ai.controller';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

describe('AiController', () => {
  it('requires a JWT so anonymous clients cannot spend the AI provider', () => {
    const guards = Reflect.getMetadata(GUARDS_METADATA, AiController);

    expect(guards).toContain(JwtAuthGuard);
  });
});
