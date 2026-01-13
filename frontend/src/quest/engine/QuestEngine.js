import { validators } from './validators.js';

/**
 * QuestEngine (Logic Layer)
 * Pure, stateless class that calculates updates and validations.
 * It does NOT hold state. It only returns results.
 */
class QuestEngine {
  constructor() {
    this.hooks = {}; // Event listeners
  }

  /**
   * registerHooks
   * Registers global side-effect listeners.
   * @param {Object} hookMap - e.g., { onAnswer: [fn1, fn2] }
   */
  registerHooks(hookMap) {
    this.hooks = hookMap;
  }

  /**
   * validate
   * Validates a single answer against a question's rules.
   * @param {Object} question - Question definition
   * @param {any} value - The User's answer
   * @returns {{ isValid: boolean, error: string | null }}
   */
  validate(question, value) {
    const rules = question.validation || {};
    
    // 1. Required Check
    if (rules.required && !validators.required(value)) {
      return { 
        isValid: false, 
        error: rules.customMessage || `${question.prompt} is required.` 
      };
    }

    // Skip other checks if empty and not required
    if (!validators.required(value)) {
      return { isValid: true, error: null };
    }

    // 2. MinLength Check
    if (rules.minLength && !validators.minLength(value, rules.minLength)) {
      const isArray = Array.isArray(value);
      return { 
        isValid: false, 
        error: rules.customMessage || 
          (isArray 
            ? `Please select at least ${rules.minLength} options.` 
            : `Must be at least ${rules.minLength} characters.`) 
      };
    }

    // 3. Pattern Check
    if (rules.pattern && !validators.pattern(value, rules.pattern)) {
      return { 
        isValid: false, 
        error: rules.customMessage || 'Invalid format.' 
      };
    }

    return { isValid: true, error: null };
  }

  /**
   * processAnswer
   * Calculates the semantic update and determines events to trigger.
   * @param {Object} question
   * @param {any} value
   * @returns {{ contextUpdate: Object, events: Array<{name: string, payload: any}> }}
   */
  processAnswer(question, value) {
    // semantic mapping
    const contextUpdate = {
      [question.key]: value
    };

    const events = [
      { name: 'onAnswer', payload: { key: question.key, value } }
    ];

    return { contextUpdate, events };
  }
}

// Singleton Logic instance
export const engine = new QuestEngine();
