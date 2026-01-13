import { create } from 'zustand';
import { engine } from './QuestEngine.js';

/**
 * useQuestStore (State Layer)
 * Owner of Truth.
 */
export const useQuestStore = create((set, get) => ({
  // --- State ---
  
  // Authoritative Semantic State (Persisted)
  context: {},
  
  // UI State (Ephemeral)
  answers: {},
  errors: {},

  // --- Actions ---

  /**
   * setContext
   * Direct override of context (e.g., from loading a saved project).
   */
  setContext: (newContext) => {
    set({ context: newContext });
  },

  /**
   * submitAnswer
   * Main entry point for user input.
   * 1. Validates via Engine
   * 2. Processes via Engine
   * 3. Updates Store
   */
  submitAnswer: (question, value) => {
    // 1. Validate
    const { isValid, error } = engine.validate(question, value);

    // Update UI state regardless (controlled inputs needs this)
    set((state) => ({
      answers: { ...state.answers, [question.id]: value },
      errors: { ...state.errors, [question.id]: error }
    }));

    if (!isValid) {
      return { success: false, error };
    }

    // 2. Process Logic
    const { contextUpdate, events } = engine.processAnswer(question, value);

    // 3. Update Authoritative Context
    set((state) => ({
      context: { ...state.context, ...contextUpdate }
    }));

    // 4. Trigger Side Effects (Hooks)
    // Note: We run these asynchronously or strictly as side-effects
    events.forEach(ev => {
        if (engine.hooks[ev.name]) {
            engine.hooks[ev.name].forEach(fn => fn(ev.payload, get().context));
        }
    });

    return { success: true };
  }
}));
