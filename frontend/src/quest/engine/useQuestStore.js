import { create } from 'zustand';
import { engine } from './QuestEngine.js';
import { LEVELS } from '../config/levels.js';


export const useQuestStore = create((set, get) => ({
  context: {},
  
  answers: {},
  errors: {},
  
  currentProjectId: null,
  projects: [],
  isLoading: false,
  hasUnsavedChanges: false,
  lastSavedAt: null,
  saveError: null,
  selectedSuggestions: {},




  _calculateProgress: () => {
    const { answers } = get();
    let completedLevels = 0;
    
    LEVELS.forEach(level => {
        const requiredQuestions = level.questions.filter(q => q.validation?.required);
        if (requiredQuestions.length === 0) return;

        const isLevelComplete = requiredQuestions.every(q => {
             const ans = answers[q.id];
             return ans && typeof ans === 'string' && ans.trim().length > 0; 
        });

        if (isLevelComplete) completedLevels++;
    });

    return Math.round((completedLevels / LEVELS.length) * 100);
  },


  setContext: (newContext) => {
    set({ context: newContext });
  },


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


  loadProject: async (id, token) => {
    set({ isLoading: true });
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        const pData = data.project.data || {};
        
        set((state) => { 
          const updatedProjects = state.projects.map(p => 
            p._id === data.project._id ? data.project : p
          );
          
          const projectExists = state.projects.find(p => p._id === data.project._id);
          const finalProjects = projectExists ? updatedProjects : [data.project, ...state.projects];
          
          return {
            currentProjectId: data.project._id,
            answers: pData.answers || (pData['q1_problem'] ? pData : {}), 
            selectedSuggestions: pData.selectedSuggestions || {}, 
            hasUnsavedChanges: false,
            lastSavedAt: data.project.updatedAt,
            saveError: null,
            projects: finalProjects
          };
        });
      }
    } catch (err) {
      console.error("Failed to load project", err);
    } finally {
      set({ isLoading: false });
    }
  },


  refreshProject: async (id, token) => {
    try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/projects/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        

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


  saveProject: async (token, title) => {
    const { currentProjectId, answers, selectedSuggestions } = get();
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
          data: {
              answers,
              selectedSuggestions,
              research: get().projects.find(p => p._id === currentProjectId)?.data?.research
          },
          meta: {
              completionPercent
          }
        })
      });
      
      const data = await res.json();
      if (data.success) {
        set((state) => {
            const updatedProjects = state.projects.map(p => 
                p._id === data.project._id ? data.project : p
            );
            
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


  updateProjectTitle: async (id, newTitle, token) => {
    const originalProjects = get().projects;
    
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
    } catch (err) {
      console.error("Failed to update title", err);
      set({ projects: originalProjects });
      return { success: false, error: err.message };
    }
    return { success: true };
  },


  deleteProject: async (id, token) => {
    const originalProjects = get().projects;

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
      set({ projects: originalProjects });
      return { success: false, error: err.message };
    }
    return { success: true };
  },


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


  submitAnswer: (question, value) => {
    const { isValid, error } = engine.validate(question, value);

    set((state) => ({
      answers: { ...state.answers, [question.id]: value },
      errors: { ...state.errors, [question.id]: error },
      hasUnsavedChanges: true
    }));

    if (!isValid) {
      return { success: false, error };
    }

    const { contextUpdate, events } = engine.processAnswer(question, value);

    set((state) => ({
      context: { ...state.context, ...contextUpdate }
    }));

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


  prefillFromDocument: (extractedData) => {
    set((state) => ({
      answers: {
        ...state.answers,
        ...extractedData
      },
      hasUnsavedChanges: true
    }));

  }
}));
