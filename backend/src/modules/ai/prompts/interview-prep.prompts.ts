export const INTERVIEW_PREP_AI_PROMPTS = {
  inferInterviewProcess: `
Infer the likely interview process for this job. Return ONLY JSON:
{
  "rounds": [
    {
      "type": "hr_screen|technical|hiring_manager|system_design|culture_fit",
      "label": "Human-readable round name",
      "durationMinutes": number,
      "weight": number between 0 and 1,
      "focusAreas": ["area1", "area2"]
    }
  ],
  "totalEstimatedDays": number
}

Job Description:
{{jobDescription}}

Use 2-5 rounds. Weights should reflect decision importance. Senior roles should include system_design when relevant.
`,

  generateStarStories: `
Generate STAR interview stories from the candidate CV for this job. Use ONLY facts from the CV — do not invent projects or metrics.

Return ONLY a JSON array (5-8 items):
[
  {
    "id": "star-1",
    "question": "Behavioral question this story answers",
    "mapsToQuestions": ["conflict", "leadership"],
    "situation": "...",
    "task": "...",
    "action": "...",
    "result": "...",
    "projectRef": "Project or job name from CV",
    "ready": false
  }
]

Job Description:
{{jobDescription}}

CV Data:
{{cvData}}

Each story must map to JD keywords. Include quantifiable results when present in CV.
`,

  generateProjectDefense: `
Generate project defense sheets for interview deep-dive. Use ONLY CV projects/experience relevant to this job.

Return ONLY a JSON array (2-4 items):
[
  {
    "projectName": "...",
    "role": "...",
    "architectureDecision": "...",
    "hardestProblem": "...",
    "outcome": "...",
    "wouldDoDifferently": "...",
    "followUpQuestions": ["q1", "q2", "q3", "q4", "q5"]
  }
]

Job Description:
{{jobDescription}}

CV Data:
{{cvData}}
`,

  evaluateMockAnswer: `
Evaluate this interview answer against the rubric. Return ONLY JSON:
{
  "score": number 0-10,
  "matchedCriteria": ["..."],
  "missingCriteria": ["..."],
  "feedback": "One paragraph actionable feedback"
}

Question: {{question}}

Evaluation rubric:
Excellent: {{excellent}}
Good: {{good}}
Weak: {{weak}}

Candidate answer:
{{answer}}
`,
} as const;

export function fillInterviewPrepPrompt(
  template: string,
  vars: Record<string, string>,
): string {
  return Object.entries(vars).reduce(
    (text, [key, value]) => text.replace(`{{${key}}}`, value),
    template,
  );
}
