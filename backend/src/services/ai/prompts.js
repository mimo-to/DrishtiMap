const ALLOWED_ACTIONS = ['suggest', 'validate', 'flag'];

const TEMPLATES = {
  'context': {
    system: "You are an expert project analyst.",
    constraints: [
      "Output JSON object: { \"suggestions\": [ ... ] }",
      "No Markdown. No code blocks.",
      "Generate exactly 6 distinct suggestions.",
      "REQUIRED KEYS: id, title, description, stakeholders, impact, cost.",
      "Do NOT return a single summary suggestion."
    ],
    task: "Generate 6 distinct project definitions based on [USER_INPUT]. Use 'title' for the Project Name.",
    schema_hint: `{ "suggestions": [{ "id": "s1", "title": "Project Option A", "description": "...", "impact": "High", "cost": "Med" }] }`
  },
  'strategy': {
    system: "You are a strategic planner.",
    constraints: [
      "Output JSON object: { \"suggestions\": [ ... ] }",
      "No Markdown. No code blocks.",
      "Generate exactly 6 distinct suggestions.",
      "REQUIRED KEYS: id, title, description, stakeholders, impact, cost.",
      "Do NOT return a single summary suggestion."
    ],
    task: "Analyze [PROJECT_BACKGROUND] (Level 1 Choices). Generate 6 Strategic Goals based on that SPECIFIC project. Do NOT summarize the context; EXPAND on it.",
    schema_hint: `{ "suggestions": [{ "id": "g1", "title": "Goal Name", "description": "...", "impact": "High", "cost": "Med" }] }`
  },
  'operation': {
    system: "You are an operations manager.",
    constraints: [
      "Output JSON object: { \"suggestions\": [ ... ] }",
      "No Markdown. No code blocks.",
      "Generate exactly 6 distinct suggestions.",
      "REQUIRED KEYS: id, title, description, stakeholders, impact, cost.",
      "Do NOT return a single summary suggestion."
    ],
    task: "Analyze [PROJECT_BACKGROUND] (Selected Goal). Generate 6 Activity Sets to execute that SPECIFIC goal. Use 'title' for the Activity Name.",
    schema_hint: `{ "suggestions": [{ "id": "a1", "title": "Activity Set", "description": "...", "impact": "High", "cost": "Med" }] }`
  },
  'measure': {
    system: "You are a monitoring specialist.",
    constraints: [
      "Output JSON object: { \"suggestions\": [ ... ] }",
      "No Markdown. No code blocks.",
      "Generate exactly 6 distinct suggestions.",
      "REQUIRED KEYS: id, title, description, stakeholders, impact, cost.",
      "Do NOT return a single summary suggestion."
    ],
    task: "Analyze [PROJECT_BACKGROUND] (Selected Activities). Generate 6 KPIs to measure those SPECIFIC activities. Use 'title' for the KPI Name.",
    schema_hint: `{ "suggestions": [{ "id": "k1", "title": "KPI Name", "description": "...", "impact": "High", "cost": "Med" }] }`
  },
  'logic': {
    system: "You are a risk analyst.",
    constraints: [
      "Output JSON object: { \"suggestions\": [ ... ] }",
      "No Markdown. No code blocks.",
      "Generate exactly 6 distinct suggestions.",
      "REQUIRED KEYS: id, title, description, stakeholders, impact, cost.",
      "Do NOT return a single summary suggestion."
    ],
    task: "Analyze [PROJECT_BACKGROUND] (Context). Generate 6 Risks specific to this plan. Use 'title' for the Risk Name.",
    schema_hint: `{ "suggestions": [{ "id": "r1", "title": "Risk Name", "description": "...", "impact": "High", "cost": "Med" }] }`
  }
};

function buildPrompt(promptId, context, input) {
  let level = promptId;
  let action = 'suggest';

  if (promptId.includes('.')) {
      [level, action] = promptId.split('.');
  }
  
  if (!ALLOWED_ACTIONS.includes(action)) {
    throw { status: 400, message: `Invalid action type: ${action}` };
  }

  const template = TEMPLATES[level];
  console.log(`[PromptBuilder] ID: ${promptId} -> Level: ${level}, Action: ${action}, TemplateFound: ${!!template}`);
  
  const effectiveTemplate = template || {
    system: "You are an advisory assistant.",
    constraints: ["Output JSON only."],
    task: `Perform action: ${action}`,
    schema_hint: "{}"
  };

  const parts = [];

  parts.push(`[SYSTEM_ROLE]\n${effectiveTemplate.system}`);

  parts.push(`[USER_INPUT]\n"${input}"`);

  let backgroundText = "";
  
  if (context.allAnswers) {
      const answers = context.allAnswers;
      const findVal = (k) => {
          const key = Object.keys(answers).find(ak => ak.toLowerCase().includes(k));
          return key ? answers[key] : null;
      };

      const prob = findVal('problem');
      const stake = findVal('stakeholder') || findVal('beneficiary');
      const target = findVal('target');
      const goal = findVal('goal') || findVal('objective');

      if (prob) backgroundText += `- Core Problem: ${prob}\n`;
      if (stake) backgroundText += `- Stakeholders: ${stake}\n`;
      if (target) backgroundText += `- Target Group: ${target}\n`;
      if (goal) backgroundText += `- Defined Goals: ${goal}\n`;
  }
  
  if (context.allSelections) {
      try {
        Object.entries(context.allSelections).forEach(([levelId, selections]) => {
            if (!selections || !Array.isArray(selections) || !selections.length) return;
            
            const titles = selections.map(s => s.title || s.Title).filter(Boolean).join(", ");
            if (!titles) return;

            let label = "Adopted Suggestions";
            if (levelId.includes('strategy') || levelId.includes('goals')) label = "Selected Strategic Goals";
            else if (levelId.includes('problem') || levelId.includes('context')) label = "Selected Project Definition";
            else if (levelId.includes('activities') || levelId.includes('operation')) label = "Selected Activities";
            else if (levelId.includes('indicators') || levelId.includes('measure')) label = "Selected KPIs";
            
            backgroundText += `- ${label}: ${titles}\n`;
        });
      } catch (e) { }
  }

  if (!backgroundText && context.q1_stakeholders) {
      backgroundText += `- Key Stakeholders: ${context.q1_stakeholders}`;
  }

  if (backgroundText) {
      parts.push(`[PROJECT_BACKGROUND]\n${backgroundText}`);
  }
  
  parts.push(`[CONSTRAINTS]\n${effectiveTemplate.constraints.join('\n')}`);

  parts.push(`[TASK]\n${effectiveTemplate.task}`);

  parts.push(`[RESPONSE_SCHEMA]\nJSON ONLY. Follow this schema: ${effectiveTemplate.schema_hint}`);

  return parts.join('\n\n');
}

module.exports = {
  buildPrompt
};
