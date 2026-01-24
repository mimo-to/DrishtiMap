export const validators = {
  required: (value) => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return true;
  },

  minLength: (value, min) => {
    if (!value) return false;
    if (typeof value === 'string') return value.trim().length >= min;
    if (Array.isArray(value)) return value.length >= min;
    return false;
  },

  pattern: (value, pattern) => {
    if (!value || typeof value !== 'string') return false;
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    return regex.test(value);
  }
};
