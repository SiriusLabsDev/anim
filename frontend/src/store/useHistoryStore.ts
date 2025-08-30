import { HistoryItem } from "@/lib/types";
import { create } from "zustand";

interface HistoryStore {
    history: HistoryItem[],
    setHistory: (history: HistoryItem[]) => void,
}

export const useHistoryStore = create<HistoryStore>((set) => ({
    history: [],
    setHistory: (history) => set({ history }),
}));