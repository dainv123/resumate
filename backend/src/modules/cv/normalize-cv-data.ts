import { CVData } from './entities/cv.entity';

/**
 * Fill sections models omit so later reads can assume arrays exist.
 * A missing `experience` or `projects` list otherwise crashes preview and export.
 */
export function normalizeCvData(data: unknown): CVData {
  const source =
    data && typeof data === 'object' && !Array.isArray(data)
      ? (data as Record<string, any>)
      : {};

  const cleanedData: CVData = {
    name: source.name || '',
    email: source.email || '',
    phone: source.phone || '',
    address: source.address || '',
    linkedin: source.linkedin || '',
    dateOfBirth: source.dateOfBirth || '',
    summary: source.summary || '',
    education: Array.isArray(source.education)
      ? source.education.map((edu: any) => ({
          degree: edu?.degree || edu?.qualification || edu?.certificate || '',
          school:
            edu?.school ||
            edu?.university ||
            edu?.institution ||
            edu?.college ||
            '',
          year: edu?.year || edu?.graduationYear || edu?.date || '',
          gpa: edu?.gpa || edu?.grade || '',
          location: edu?.location || edu?.place || '',
          honors: edu?.honors || edu?.awards || edu?.achievements || '',
        }))
      : [],
    experience: Array.isArray(source.experience)
      ? source.experience.map((exp: any) => ({
          title: exp?.title || exp?.role || exp?.position || '',
          company: exp?.company || exp?.employer || '',
          duration: exp?.duration || exp?.period || exp?.timeframe || '',
          teamSize: exp?.teamSize || '',
          companyDescription: exp?.companyDescription || '',
          responsibilities: Array.isArray(exp?.responsibilities)
            ? exp.responsibilities
            : [],
          achievements: Array.isArray(exp?.achievements)
            ? exp.achievements
            : [],
          technologies: Array.isArray(exp?.technologies)
            ? exp.technologies
            : [],
          subProjects: Array.isArray(exp?.subProjects)
            ? exp.subProjects.map((sub: any) => ({
                name: sub?.name || '',
                role: sub?.role || '',
                techStack: Array.isArray(sub?.techStack) ? sub.techStack : [],
                responsibilities: Array.isArray(sub?.responsibilities)
                  ? sub.responsibilities
                  : [],
              }))
            : [],
        }))
      : [],
    skills: {
      technical: Array.isArray(source.skills?.technical)
        ? source.skills.technical
        : [],
      soft: Array.isArray(source.skills?.soft) ? source.skills.soft : [],
      languages: Array.isArray(source.skills?.languages)
        ? source.skills.languages
        : [],
      tools: Array.isArray(source.skills?.tools) ? source.skills.tools : [],
    },
    projects: Array.isArray(source.projects)
      ? source.projects.map((project: any) => ({
          name: project?.name || '',
          duration: project?.duration || '',
          description: project?.description || '',
          techStack: Array.isArray(project?.techStack) ? project.techStack : [],
          results: project?.results || '',
          link: project?.link || '',
        }))
      : [],
    certifications: Array.isArray(source.certifications)
      ? source.certifications.map((cert: any) => ({
          name: cert?.name || '',
          issuer: cert?.issuer || '',
          date: cert?.date || cert?.issueDate || '',
          link: cert?.link || cert?.certificateLink || '',
        }))
      : [],
    awards: Array.isArray(source.awards) ? source.awards : [],
    publications: Array.isArray(source.publications) ? source.publications : [],
    volunteer: Array.isArray(source.volunteer) ? source.volunteer : [],
  };

  if (Array.isArray(source.skills) && source.skills.length > 0) {
    const technicalKeywords = [
      'programming',
      'development',
      'coding',
      'software',
      'technical',
      'database',
      'web',
      'mobile',
      'cloud',
      'devops',
      'ai',
      'ml',
      'data',
      'analytics',
    ];
    const softKeywords = [
      'leadership',
      'communication',
      'teamwork',
      'management',
      'problem',
      'creative',
      'analytical',
      'interpersonal',
      'presentation',
      'negotiation',
    ];
    const languageKeywords = [
      'english',
      'spanish',
      'french',
      'german',
      'chinese',
      'japanese',
      'korean',
      'arabic',
      'portuguese',
      'italian',
      'russian',
    ];

    source.skills.forEach((skill: unknown) => {
      if (typeof skill !== 'string') {
        return;
      }
      const skillLower = skill.toLowerCase();
      if (technicalKeywords.some((keyword) => skillLower.includes(keyword))) {
        cleanedData.skills.technical.push(skill);
      } else if (softKeywords.some((keyword) => skillLower.includes(keyword))) {
        cleanedData.skills.soft.push(skill);
      } else if (
        languageKeywords.some((keyword) => skillLower.includes(keyword))
      ) {
        cleanedData.skills.languages.push(skill);
      } else {
        cleanedData.skills.technical.push(skill);
      }
    });
  }

  return cleanedData;
}
