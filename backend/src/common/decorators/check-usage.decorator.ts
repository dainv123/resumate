import { SetMetadata } from '@nestjs/common';

export const CHECK_USAGE_KEY = 'checkUsage';

/**
 * Check usage limit for a feature
 * @param feature Feature name ('cvUploads', 'projects', 'jobTailors', 'exports')
 */
export const CheckUsage = (feature: string) =>
  SetMetadata(CHECK_USAGE_KEY, feature);

