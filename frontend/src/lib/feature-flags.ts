export function isInterviewPrepEnabled(): boolean {
  return process.env.NEXT_PUBLIC_INTERVIEW_PREP_ENABLED !== 'false';
}
