export const QUESTION_BANK_ENRICH_PROMPT = `You are an expert interview coach. For each interview question below, generate evaluation metadata for mock drill scoring.

Return ONLY JSON:
{
  "items": [
    {
      "id": "same id from input",
      "evaluationRubric": {
        "excellent": ["3-5 specific criteria for a strong answer"],
        "good": ["2-3 criteria for an acceptable answer"],
        "weak": ["2-3 criteria for a poor answer"]
      },
      "sampleAnswerOutline": ["4-6 bullet steps tailored to THIS question"],
      "followUpQuestions": ["2-3 realistic interviewer follow-ups"],
      "prepTimeMinutes": number
    }
  ]
}

Rules:
- Criteria must be specific to the question, not generic interview advice.
- For system-design questions, excellent criteria must mention requirements, scale, data model, and trade-offs.
- For behavioral questions, excellent criteria must mention STAR structure and measurable outcomes.
- prepTimeMinutes: behavioral 10-20, technical 15-25, system-design 30-45.
- Keep JSON keys in English.

Questions (JSON array):
{{questions}}
`;

export function fillQuestionBankEnrichPrompt(questionsJson: string): string {
  return QUESTION_BANK_ENRICH_PROMPT.replace('{{questions}}', questionsJson);
}
