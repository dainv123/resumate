import { normalizeCvData } from './normalize-cv-data';

describe('normalizeCvData', () => {
  it('keeps provided experience and fills sections the model omitted', () => {
    const normalized = normalizeCvData({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      experience: [
        {
          role: 'Engineer',
          company: 'Analytical Engines',
          duration: '1843',
          responsibilities: ['Wrote notes'],
        },
      ],
    });

    expect(normalized.name).toBe('Ada Lovelace');
    expect(normalized.experience).toEqual([
      {
        title: 'Engineer',
        company: 'Analytical Engines',
        duration: '1843',
        teamSize: '',
        companyDescription: '',
        responsibilities: ['Wrote notes'],
        achievements: [],
        technologies: [],
        subProjects: [],
      },
    ]);
    expect(normalized.projects).toEqual([]);
    expect(normalized.education).toEqual([]);
    expect(normalized.skills.technical).toEqual([]);
    expect(normalized.certifications).toEqual([]);
    expect(normalized.awards).toEqual([]);
    expect(normalized.publications).toEqual([]);
    expect(normalized.volunteer).toEqual([]);
  });

  it('turns a non-object model response into an empty resume instead of throwing', () => {
    const normalized = normalizeCvData(null);

    expect(normalized.name).toBe('');
    expect(normalized.experience).toEqual([]);
    expect(normalized.projects).toEqual([]);
  });
});
