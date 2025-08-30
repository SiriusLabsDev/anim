import { create } from "zustand";
import { type Message } from "@/lib/types";

interface ChatStore {
    title?: string;
    setTitle: (title: string | undefined) => void;
    messages: Message[];
    setMessages: (messages: Message[]) => void;
}

const useChatStore = create<ChatStore>((set) => ({
    title: undefined,
    setTitle: (title) => set({ title }),
    messages: [],
    setMessages: (messages) => set({ messages }),
}));

export default useChatStore;
