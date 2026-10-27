import { isInterviewPrepEnabled } from '@/lib/feature-flags';

export const PREFILL_KEY = 'interviewPrepPrefill';
export const PREP_FORCE_WIZARD_KEY = 'interviewPrepForceWizard';
export const PREP_ONBOARDING_DONE_KEY = 'interviewPrepOnboardingCompleted';

export interface InterviewPrepPrefill {
  cvId?: string;
  jobDescription?: string;
}

export function saveInterviewPrepPrefill(
  cvId: string,
  jobDescription: string,
): void {
  sessionStorage.setItem(
    PREFILL_KEY,
    JSON.stringify({ cvId, jobDescription }),
  );
  sessionStorage.setItem(PREP_FORCE_WIZARD_KEY, 'true');
}

export function peekInterviewPrepPrefill(): InterviewPrepPrefill | null {
  const raw = sessionStorage.getItem(PREFILL_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as InterviewPrepPrefill;
  } catch {
    return null;
  }
}

export function consumeInterviewPrepPrefill(): InterviewPrepPrefill | null {
  const prefill = peekInterviewPrepPrefill();
  if (prefill) sessionStorage.removeItem(PREFILL_KEY);
  return prefill;
}

export function clearForcePrepWizard(): void {
  sessionStorage.removeItem(PREP_FORCE_WIZARD_KEY);
}

export function shouldForcePrepWizard(): boolean {
  return sessionStorage.getItem(PREP_FORCE_WIZARD_KEY) === 'true';
}

export function isPrepOnboardingDone(): boolean {
  return localStorage.getItem(PREP_ONBOARDING_DONE_KEY) === 'true';
}

export function markPrepOnboardingDone(): void {
  localStorage.setItem(PREP_ONBOARDING_DONE_KEY, 'true');
  clearForcePrepWizard();
}

export function shouldShowPrepWizard(
  planCount: number,
  cvCount: number,
): boolean {
  if (!isInterviewPrepEnabled()) return false;
  if (cvCount === 0) return false;
  if (planCount > 0 && !shouldForcePrepWizard()) return false;
  if (shouldForcePrepWizard()) return true;
  return !isPrepOnboardingDone();
}

export function defaultInterviewDate(daysAhead = 7): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().slice(0, 10);
}
