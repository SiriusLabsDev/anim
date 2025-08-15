import { create } from 'zustand';

interface PromptStore {
  lastPrompt: string;
  setLastPrompt: (prompt: string) => void;
  waitingForMessage: boolean;
  setWaitingForMessage: (waiting: boolean) => void; 
}

export const usePromptStore = create<PromptStore>()((set) => ({
      lastPrompt: '',
      setLastPrompt: (prompt: string) => set({ lastPrompt: prompt }),
      waitingForMessage: false,
      setWaitingForMessage: (waiting) => set({ waitingForMessage: waiting }),
    }),
);