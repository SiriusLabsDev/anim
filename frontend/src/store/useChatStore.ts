import { create } from "zustand";
import { type Message } from "@/lib/types";

interface ChatStore {
    title?: string;
    chatWorkflowRunning: boolean;
    generatingTitle: boolean;
    messages: Message[];

    setTitle: (title: string | undefined) => void;
    setChatWorkflowRunning: (chatWorkflowRunning: boolean) => void;
    setGeneratingTitle: (generatingTitle: boolean) => void;
    setMessages: (messages: Message[]) => void;

    prompt: string;
    lastPrompt: string;
    startGeneration: boolean;

    setStartGeneration: (waiting: boolean) => void; 
    setLastPrompt: (prompt: string) => void;
    setPrompt: (prompt: string) => void;

    appendLastPromptToMessages: (scrollToDiv: () => void) => string | undefined;
}

const useChatStore = create<ChatStore>((set, get) => ({
    title: undefined,
    chatWorkflowRunning: false,
    generatingTitle: false,
    messages: [],
    setChatWorkflowRunning: (chatWorkflowRunning) => set({ chatWorkflowRunning }),
    setTitle: (title) => set({ title }),
    setGeneratingTitle: (generatingTitle) => set({ generatingTitle }),
    setMessages: (messages) => set({ messages }),

    prompt: '',
    lastPrompt: '',
    startGeneration: false,
    setPrompt: (prompt: string) => set({ prompt }),
    setLastPrompt: (prompt: string) => set({ lastPrompt: prompt }),
    setStartGeneration: (waiting) => set({ startGeneration: waiting }),

    appendLastPromptToMessages: (scrollToDiv) => {
        const { lastPrompt, setLastPrompt } = get();
        if (lastPrompt.trim() === "") return undefined;

        const {setMessages, messages: prevMessages} = get();
        const newMessages = [...prevMessages, {id: "random", prompt: lastPrompt, response: ""}];

        setMessages(newMessages);
        setLastPrompt("");

        setTimeout(() => {
            scrollToDiv();
        }, 100);

        return lastPrompt;
    },
}));

export default useChatStore;
