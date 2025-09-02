import { create } from "zustand";
import { type Message } from "@/lib/types";

interface ChatStore {
    title?: string;
    setTitle: (title: string | undefined) => void;
    processingPrompt: boolean;
    setProcessingPrompt: (processingPrompt: boolean) => void;
    freezeInput: boolean;
    setFreezeInput: (freezeInput: boolean) => void;
    messages: Message[];
    setMessages: (messages: Message[]) => void;
}

const useChatStore = create<ChatStore>((set) => ({
    title: undefined,
    setTitle: (title) => set({ title }),
    processingPrompt: false,
    setProcessingPrompt: (processingPrompt) => set({ processingPrompt }),
    freezeInput: false,
    setFreezeInput: (freezeInput) => set({ freezeInput }),
    messages: [],
    setMessages: (messages) => set({ messages }),
}));

export default useChatStore;
