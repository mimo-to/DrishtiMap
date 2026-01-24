import { validators } from './validators.js';

class QuestEngine {
  constructor() {
    this.hooks = {};
  }

  registerHooks(hookMap) {
    this.hooks = hookMap;
  }

  validate(question, value) {
    const rules = question.validation || {};
    
    if (rules.required && !validators.required(value)) {
      return { 
        isValid: false, 
        error: rules.customMessage || `${question.prompt} is required.` 
      };
    }

    if (!validators.required(value)) {
      return { isValid: true, error: null };
    }

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

    if (rules.pattern && !validators.pattern(value, rules.pattern)) {
      return { 
        isValid: false, 
        error: rules.customMessage || 'Invalid format.' 
      };
    }

    return { isValid: true, error: null };
  }

  processAnswer(question, value) {
    const contextUpdate = {
      [question.key]: value
    };

    const events = [
      { name: 'onAnswer', payload: { key: question.key, value } }
    ];

    return { contextUpdate, events };
  }
}

export const engine = new QuestEngine();
