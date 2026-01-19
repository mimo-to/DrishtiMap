import { create } from 'zustand';
import { engine } from './QuestEngine.js';
import { LEVELS } from '../config/levels.js';

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
  
  // Persistence State
  currentProjectId: null,
  projects: [],
  isLoading: false,
  hasUnsavedChanges: false,
  lastSavedAt: null,
  saveError: null,
  selectedSuggestions: {}, // { levelId: [items] }

  // --- Actions ---

  /**
   * _calculateProgress (Internal Helper)
   * Returns a number 0-100 based on level completion.
   * Simple Rule: Each Level is 20%. Level is complete if all required fields are filled.
   */
  _calculateProgress: () => {
    const { answers } = get();
    let completedLevels = 0;
    
    LEVELS.forEach(level => {
        const requiredQuestions = level.questions.filter(q => q.validation?.required);
        if (requiredQuestions.length === 0) return; // Should not happen

        const isLevelComplete = requiredQuestions.every(q => {
             const ans = answers[q.id];
             // Check if answer exists and has length
             return ans && typeof ans === 'string' && ans.trim().length > 0; 
        });

        if (isLevelComplete) completedLevels++;
    });

    return Math.round((completedLevels / LEVELS.length) * 100);
  },

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
        // Migration: Handle structure differences
        const pData = data.project.data || {};
        
        // Load data into store
        set((state) => { 
          // Update the projects array with the fresh project data
          const updatedProjects = state.projects.map(p => 
            p._id === data.project._id ? data.project : p
          );
          
          // If project not in list, add it
          const projectExists = state.projects.find(p => p._id === data.project._id);
          const finalProjects = projectExists ? updatedProjects : [data.project, ...state.projects];
          
          return {
            currentProjectId: data.project._id,
            // Support new { data: { answers, selectedSuggestions } } AND legacy flat format
            answers: pData.answers || (pData['q1_problem'] ? pData : {}), 
            selectedSuggestions: pData.selectedSuggestions || {}, 
            hasUnsavedChanges: false,
            lastSavedAt: data.project.updatedAt,
            saveError: null,
            projects: finalProjects // Update projects array
          };
        });
      }
    } catch (err) {
      console.error("Failed to load project", err);
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * refreshProject
   * Silently re-fetches project data to sync backend state (e.g. after AI research).
   */
  refreshProject: async (id, token) => {
    try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/projects/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        // Check if response is OK before parsing JSON
        if (!res.ok) {
            console.error(`Failed to refresh project: ${res.status} ${res.statusText}`);
            return;
        }
        
        const data = await res.json();
        if (data.success) {
            set((state) => ({
                projects: state.projects.map(p => 
                    p._id === id ? data.project : p
                )
            }));
            
            // Should we update current active state too? Yes, but carefully
            if (get().currentProjectId === id) {
                 const pData = data.project.data || {};
                 set({
                     answers: pData.answers || (pData['q1_problem'] ? pData : {}),
                     selectedSuggestions: pData.selectedSuggestions || {}
                 });
            }
        }
    } catch (err) {
        console.error("Silent refresh failed", err);
    }
  },

  /**
   * saveProject
   * Persists current state to MongoDB.
   */
  saveProject: async (token, title) => {
    const { currentProjectId, answers, selectedSuggestions } = get();
    // Calculate live progress
    const completionPercent = get()._calculateProgress();
    
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
          title,
          // Wrap main data
          data: {
              answers,
              selectedSuggestions,
              // Critical: Preserve research data if it exists in the current project state
              research: get().projects.find(p => p._id === currentProjectId)?.data?.research
          },
          // Send Metadata
          meta: {
              completionPercent
          }
        })
      });
      
      const data = await res.json();
      if (data.success) {
        set((state) => {
            // Update the specific project in our list with the fresh data (including new title)
            const updatedProjects = state.projects.map(p => 
                p._id === data.project._id ? data.project : p
            );
            
            // If it's a new project, it might not be in the list yet?
            // Actually saveProject handles both create and update.
            // If create, we should add it.
            const projectExists = state.projects.find(p => p._id === data.project._id);
            const finalProjects = projectExists 
                ? updatedProjects 
                : [data.project, ...state.projects];

            return { 
                currentProjectId: data.project._id,
                hasUnsavedChanges: false,
                saveError: null,
                lastSavedAt: new Date().toISOString(),
                projects: finalProjects
            };
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
      saveError: null,
      selectedSuggestions: {}
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
  },

  toggleSuggestion: (levelId, suggestion) => {
    set((state) => {
        const currentList = state.selectedSuggestions[levelId] || [];
        const exists = currentList.find(s => s.id === suggestion.id);
        const newList = exists 
            ? currentList.filter(s => s.id !== suggestion.id)
            : [...currentList, suggestion];
        
        return {
            selectedSuggestions: {
                ...state.selectedSuggestions,
                [levelId]: newList
            },
            hasUnsavedChanges: true
        };
    });
  },

  clearSelections: (levelId) => {
    set((state) => ({
        selectedSuggestions: {
            ...state.selectedSuggestions,
            [levelId]: []
        },
        hasUnsavedChanges: true
    }));
  },

  /**
   * Pre-fill answers from document analysis
   * Used when user uploads a document and AI extracts information
   */
  prefillFromDocument: (extractedData) => {
    set((state) => ({
      answers: {
        ...state.answers,
        ...extractedData
      },
      hasUnsavedChanges: true
    }));
    console.log('✨ Pre-filled answers from document:', extractedData);
  }
}));
