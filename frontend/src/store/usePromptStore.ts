import { create } from 'zustand';

interface PromptStore {
  prompt: string;
  setPrompt: (prompt: string) => void;
  lastPrompt: string;
  setLastPrompt: (prompt: string) => void;
  startGeneration: boolean;
  setStartGeneration: (waiting: boolean) => void; 
}

export const usePromptStore = create<PromptStore>()((set) => ({
  prompt: '',
  setPrompt: (prompt: string) => set({ prompt }),
  lastPrompt: '',
  setLastPrompt: (prompt: string) => set({ lastPrompt: prompt }),
  startGeneration: false,
  setStartGeneration: (waiting) => set({ startGeneration: waiting }),
}));