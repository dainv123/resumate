import { QuestionEmbeddingService } from './question-embedding.service';
import { QuestionBank } from '../entities/question-bank.entity';
import {
  QuestionCategory,
  QuestionLevel,
} from '../constants/interview-prep.constants';

describe('QuestionEmbeddingService', () => {
  const service = new QuestionEmbeddingService(
    {} as any,
    {} as any,
  );

  it('buildDocumentText includes category, skills, and question', () => {
    const q = {
      id: 'q1',
      category: QuestionCategory.TECHNICAL,
      subcategory: 'react',
      level: QuestionLevel.SENIOR,
      skillTags: ['React', 'TypeScript'],
      question: 'Explain React concurrent rendering',
      sampleAnswerOutline: ['Define concurrent features', 'Give example'],
    } as QuestionBank;

    const text = service.buildDocumentText(q);

    expect(text).toContain('category:technical');
    expect(text).toContain('skills:React,TypeScript');
    expect(text).toContain('Q:Explain React concurrent rendering');
    expect(text).toContain('outline:Define concurrent features');
  });

  it('buildQueryText includes JD and gaps', () => {
    const text = service.buildQueryText('Senior React role', ['hooks', 'aws']);
    expect(text).toContain('Senior React role');
    expect(text).toContain('gaps: hooks, aws');
  });
});
