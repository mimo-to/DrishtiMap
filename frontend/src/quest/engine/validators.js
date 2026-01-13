/**
 * Pure validation logic for Quest Answers.
 */

export const validators = {
  /**
   * Checks if a value is present.
   * @param {any} value 
   * @returns {boolean}
   */
  required: (value) => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return true; // Numbers/Booleans are valid if present
  },

  /**
   * Checks minimum length (characters for string, count for arrays).
   * @param {string|Array} value 
   * @param {number} min 
   * @returns {boolean}
   */
  minLength: (value, min) => {
    if (!value) return false;
    if (typeof value === 'string') return value.trim().length >= min;
    if (Array.isArray(value)) return value.length >= min;
    return false;
  },

  /**
   * Checks against a regex pattern.
   * @param {string} value 
   * @param {string|RegExp} pattern 
   * @returns {boolean}
   */
  pattern: (value, pattern) => {
    if (!value || typeof value !== 'string') return false;
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    return regex.test(value);
  }
};
