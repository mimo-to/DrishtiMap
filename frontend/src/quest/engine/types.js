/**
 * @typedef {'text' | 'long_text' | 'single_select' | 'multi_select' | 'structured'} QuestionType
 */

/**
 * @typedef {Object} ValidationRules
 * @property {boolean} [required] - Is the field mandatory?
 * @property {number} [minLength] - Minimum characters (text) or minimum selections (array).
 * @property {string} [pattern] - Regex pattern string for text validation.
 * @property {string} [customMessage] - Custom error message.
 */

/**
 * @typedef {Object} Question
 * @property {string} id - Unique identifier for the question (e.g., 'q_1_problem').
 * @property {string} key - Semantic context key (e.g., 'problemStatement').
 * @property {QuestionType} type - The UI input type.
 * @property {string} prompt - The main question text.
 * @property {string} [helpText] - Optional helper text.
 * @property {ValidationRules} validation - Validation rules.
 * @property {Array<{label: string, value: any}>} [options] - Options for select types.
 */

/**
 * @typedef {Object} QuestContext
 * Represents the authoritative, accumulated semantic state of the LFA.
 * Keys correspond to `Question.key`.
 */

export const Types = {}; // File is primarily for JSDoc documentation and constant exports if needed.
