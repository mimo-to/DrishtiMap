
export const LEVELS = [
  {
    id: 'context',
    title: 'Level 1: The Context',
    description: 'Define the core problem and who is involved.',
    questions: [
      {
        id: 'q1_problem',
        key: 'problemStatement',
        type: 'long_text',
        prompt: 'What is the core problem?',
        helpText: 'Describe the central issue you intend to address.',
        validation: { required: true, minLength: 20 }
      },
      {
        id: 'q1_stakeholders',
        key: 'stakeholders',
        type: 'text',
        prompt: 'Who are the key stakeholders?',
        helpText: 'List the main groups involved (comma separated for now).',
        validation: { required: true }
      }
    ]
  },
  {
    id: 'strategy',
    title: 'Level 2: The Strategy',
    description: 'Define your desired Change (Impact) and what you will deliver (Outputs).',
    questions: [
      {
        id: 'q2_impact',
        key: 'impact',
        type: 'long_text',
        prompt: 'What is the Overall Goal (Impact)?',
        helpText: 'The long-term change you want to see.',
        validation: { required: true }
      },
      {
        id: 'q2_outcome',
        key: 'outcome',
        type: 'long_text',
        prompt: 'What is the Project Purpose (Outcome)?',
        helpText: 'The immediate benefit of the project.',
        validation: { required: true }
      }
    ]
  },
  {
    id: 'operation',
    title: 'Level 3: The Operation',
    description: 'Define Activities and Resources.',
    questions: [
      {
        id: 'q3_activities',
        key: 'activities',
        type: 'long_text',
        prompt: 'What are the Key Activities?',
        validation: { required: true }
      }
    ]
  },
  {
    id: 'measure',
    title: 'Level 4: The Measure',
    description: 'Define Indicators and Verification means.',
    questions: [
      {
        id: 'q4_indicators',
        key: 'indicators',
        type: 'long_text',
        prompt: 'Key Performance Indicators (KPIs)',
        validation: { required: true }
      }
    ]
  },
  {
    id: 'logic',
    title: 'Level 5: The Logic Check',
    description: 'Review Assumptions and Risks.',
    questions: [
      {
        id: 'q5_assumptions',
        key: 'assumptions',
        type: 'long_text',
        prompt: 'Critical Assumptions',
        validation: { required: true }
      }
    ]
  }
];

export const getLevelById = (id) => LEVELS.find(l => l.id === id);
export const getLevelIndex = (id) => LEVELS.findIndex(l => l.id === id);
export const getNextLevelId = (currentId) => {
  const idx = getLevelIndex(currentId);
  if (idx >= 0 && idx < LEVELS.length - 1) return LEVELS[idx + 1].id;
  return null;
};
export const getPrevLevelId = (currentId) => {
  const idx = getLevelIndex(currentId);
  if (idx > 0) return LEVELS[idx - 1].id;
  return null;
};
