/**
 * STRICT PROMPT BUILDER (Phase 6.2 Architecture)
 * Enforces mandatory structure: Role + Input + Context + Constraints + JSON.
 */

const ALLOWED_ACTIONS = ['suggest', 'validate', 'flag'];

// LFA-Specific Templates
// In a real app, these might be loaded from DB or larger config.
// For MVP, we stick to the required structure in code.
const TEMPLATES = {
  'problem_statement': {
    system: "You are an advisory assistant (Co-Pilot). You DO NOT write content. You only suggest structural improvements or flag vagueness.",
    constraints: [
      "Do not use proper nouns unless present in input.",
      "Do not invent numeric facts.",
      "Output JSON only."
    ],
    task: "Analyze the User Input for clarity and specificity. Suggest 2-3 structural improvements.",
    schema_hint: '{ "suggestions": ["..."] }'
  },
  // Add other levels as needed
};

function buildPrompt(promptId, context, input) {
  // 1. DECODE PROMPT ID (e.g. "problem_statement.suggest")
  const [level, action] = promptId.split('.');
  
  // 2. ACTION GUARD
  if (!ALLOWED_ACTIONS.includes(action)) {
    throw { status: 400, message: `Invalid action type: ${action}` };
  }

  const template = TEMPLATES[level];
  // Fallback for demo purposes if level not defined yet, strictly generic but safe
  const effectiveTemplate = template || {
    system: "You are an advisory assistant.",
    constraints: ["Output JSON only."],
    task: `Perform action: ${action}`,
    schema_hint: "{}"
  };

  // 3. CONSTRUCT PROMPT PARTS
  const parts = [];

  // A. SYSTEM ROLE
  parts.push(`[SYSTEM_ROLE]\n${effectiveTemplate.system}`);

  // B. USER INPUT (PRIMARY)
  // Input already validated for length in service
  parts.push(`[USER_INPUT]\n"${input}"`);

  // C. CONTEXT (SCOPED)
  // Only include allowed fields. For now, strictly minimal.
  // In future phases, whitelist specific context keys here.
  const safeContext = { level: level }; 
  parts.push(`[CONTEXT]\n${JSON.stringify(safeContext)}`);

  // D. CONSTRAINTS (HARD)
  parts.push(`[CONSTRAINTS]\n${effectiveTemplate.constraints.join('\n')}`);

  // E. TASK
  parts.push(`[TASK]\n${effectiveTemplate.task}`);

  // F. OUTPUT FORMAT
  parts.push(`[OUTPUT_FORMAT]\nJSON ONLY. Follow this schema: ${effectiveTemplate.schema_hint}`);

  return parts.join('\n\n');
}

module.exports = {
  buildPrompt
};
