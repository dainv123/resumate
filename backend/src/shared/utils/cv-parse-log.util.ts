import { CVData } from '../interfaces/cv-data.interface';

const PREVIEW_LEN = 500;
const FULL_LOG_CHUNK = 4000;

export function cvParseShouldLogFull(): boolean {
  return (
    process.env.CV_PARSE_LOG_FULL === 'true' ||
    process.env.NODE_ENV === 'development'
  );
}

export function cvParseTextPreview(text: string): string {
  return text.replace(/\s+/g, ' ').trim().slice(0, PREVIEW_LEN);
}

export function cvParseSectionMarkers(text: string) {
  return {
    hasAboutMe: /ABOUT\s*ME/i.test(text),
    hasWorkExperience: /WORK\s*EXPERIENCE/i.test(text),
    hasEducation: /EDUCATION/i.test(text),
    hasSkills: /\bSKILL/i.test(text),
    hasHighlightProject: /HIGHLIGHT\s*PROJECT/i.test(text),
    hasCertificates: /CERTIFICATE/i.test(text),
    hasRakkar: /rakkar/i.test(text),
    hasJobLogic: /job\s*logic/i.test(text),
    hasSutrix: /sutrix/i.test(text),
  };
}

export function cvParseSummarizeExtracted(text: string) {
  return {
    charLength: text.length,
    lineCount: text.split(/\n/).filter((l) => l.trim()).length,
    preview: cvParseTextPreview(text),
    sections: cvParseSectionMarkers(text),
    hasEmail: /@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/.test(text),
    hasPhone: /\d{9,}/.test(text),
    isEmpty: text.trim().length === 0,
  };
}

/** Log full text in chunks (Nest/console may truncate single huge lines). */
export function cvParseLogFullText(
  log: (message: string) => void,
  tag: string,
  text: string,
): void {
  const total = Math.max(1, Math.ceil(text.length / FULL_LOG_CHUNK));
  log(`[CV_PARSE] ${tag}_begin chars=${text.length} parts=${total}`);
  for (let i = 0; i < total; i++) {
    const part = text.slice(i * FULL_LOG_CHUNK, (i + 1) * FULL_LOG_CHUNK);
    log(`[CV_PARSE] ${tag} part=${i + 1}/${total}\n${part}`);
  }
  log(`[CV_PARSE] ${tag}_end`);
}

export function cvParseSummarizeResult(data: CVData) {
  return {
    name: data.contact?.name ?? '',
    email: data.contact?.email ?? '',
    experienceCount: data.experience?.length ?? 0,
    educationCount: data.education?.length ?? 0,
    technicalSkillsCount: data.skills?.technical?.length ?? 0,
    summaryLength: data.summary?.length ?? 0,
  };
}

export function cvParseFormatError(error: unknown): string {
  if (!error || typeof error !== 'object') {
    return String(error);
  }
  const e = error as {
    message?: string;
    status?: number;
    statusText?: string;
    code?: string;
  };
  return [e.status, e.statusText, e.code, e.message].filter(Boolean).join(' | ');
}
