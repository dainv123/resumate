import { getMetadataArgsStorage } from 'typeorm';
import { Cv } from './cv.entity';

describe('Cv entity', () => {
  it('does not map legacy analysis columns dropped from cvs', () => {
    const columns = getMetadataArgsStorage()
      .columns.filter((column) => column.target === Cv)
      .map((column) => column.propertyName);

    expect(columns).not.toContain('matchingAnalysis');
    expect(columns).not.toContain('coverLetter');
    expect(columns).toContain('parsedData');
    expect(columns).toContain('jobDescriptionId');
  });
});
