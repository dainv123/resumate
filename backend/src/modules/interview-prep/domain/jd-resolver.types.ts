import { JobDescriptionSourceType } from '../constants/interview-prep.constants';

export interface ResolvedJobDescription {
  description: string;
  title: string;
  company?: string;
  location?: string;
  sourceUrl: string;
  sourceType: JobDescriptionSourceType;
}
