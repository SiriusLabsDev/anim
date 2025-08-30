import { create } from 'zustand';

interface PromptStore {
  prompt: string;
  setPrompt: (prompt: string) => void;
  lastPrompt: string;
  setLastPrompt: (prompt: string) => void;
  waitingForMessage: boolean;
  setWaitingForMessage: (waiting: boolean) => void; 
}

export const usePromptStore = create<PromptStore>()((set) => ({
  prompt: '',
  setPrompt: (prompt: string) => set({ prompt }),
  lastPrompt: '',
  setLastPrompt: (prompt: string) => set({ lastPrompt: prompt }),
  waitingForMessage: false,
  setWaitingForMessage: (waiting) => set({ waitingForMessage: waiting }),
}));