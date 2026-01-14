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
  // UI State (Ephemeral)
  answers: {},
  errors: {},
  
  // Persistence State
  currentProjectId: null,
  projects: [],
  isLoading: false,
  hasUnsavedChanges: false,
  lastSavedAt: null,
  saveError: null,

  // --- Actions ---

  /**
   * setContext
   * Direct override of context (e.g., from loading a saved project).
   */
  setContext: (newContext) => {
    set({ context: newContext });
  },

  /**
   * loadProjects
   * Fetches all projects for the user.
   */
  loadProjects: async (token) => {
    set({ isLoading: true });
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/projects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        set({ projects: data.projects });
      }
    } catch (err) {
      console.error("Failed to load projects", err);
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * loadProject
   * Loads a specific project into the store active state.
   */
  loadProject: async (id, token) => {
    set({ isLoading: true });
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        // Load data into store
        set({ 
          currentProjectId: data.project._id,
          answers: data.project.data || {}, // Restore answers
          hasUnsavedChanges: false,
          lastSavedAt: data.project.updatedAt,
          saveError: null
        });
      }
    } catch (err) {
      console.error("Failed to load project", err);
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * saveProject
   * Persists current state to MongoDB.
   */
  saveProject: async (token, title) => {
    const { currentProjectId, answers } = get();
    set({ isLoading: true, saveError: null });
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/projects`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          projectId: currentProjectId,
          answers,
          title
        })
      });
      
      const data = await res.json();
      if (data.success) {
        set({ 
            currentProjectId: data.project._id,
            hasUnsavedChanges: false,
            saveError: null,
            lastSavedAt: new Date().toISOString()
        });
      } else {
        throw new Error(data.error || 'Save failed');
      }
      return data;
    } catch (err) {
      console.error("Failed to save project", err);
      set({ saveError: err.message });
      return { success: false, error: err.message };
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * updateProjectTitle (Optimistic)
   */
  updateProjectTitle: async (id, newTitle, token) => {
    const originalProjects = get().projects;
    
    // Optimistic Update
    set(state => ({
      projects: state.projects.map(p => 
        p._id === id ? { ...p, title: newTitle } : p
      )
    }));

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/projects/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ title: newTitle })
      });
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Update failed');
      }
      // Success - state already updated
    } catch (err) {
      console.error("Failed to update title", err);
      // Revert on failure
      set({ projects: originalProjects });
      return { success: false, error: err.message };
    }
    return { success: true };
  },

  /**
   * deleteProject (Optimistic)
   */
  deleteProject: async (id, token) => {
    const originalProjects = get().projects;

    // Optimistic Update
    set(state => ({
      projects: state.projects.filter(p => p._id !== id)
    }));

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/projects/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Delete failed');
      }
    } catch (err) {
      console.error("Failed to delete project", err);
      // Revert on failure
      set({ projects: originalProjects });
      return { success: false, error: err.message };
    }
    return { success: true };
  },

  /**
   * resetStore
   * Clears state for a new project.
   */
  resetStore: () => {
    set({ 
      currentProjectId: null, 
      answers: {}, 
      errors: {}, 
      context: {},
      hasUnsavedChanges: false,
      lastSavedAt: null,
      saveError: null
    });
  },

  /**
   * submitAnswer
   * Main entry point for user input.
   */
  submitAnswer: (question, value) => {
    // 1. Validate
    const { isValid, error } = engine.validate(question, value);

    // Update UI state regardless
    set((state) => ({
      answers: { ...state.answers, [question.id]: value },
      errors: { ...state.errors, [question.id]: error },
      hasUnsavedChanges: true // Mark as unsaved
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

    // 4. Trigger Side Effects
    events.forEach(ev => {
        if (engine.hooks[ev.name]) {
            engine.hooks[ev.name].forEach(fn => fn(ev.payload, get().context));
        }
    });

    return { success: true };
  }
}));
