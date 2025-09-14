export type messageState = "waiting" | "writing" | "coding" | "generating"

export interface HistoryItem {
    id: string;
    title: string;
}
export interface Message {
    id: string;
    prompt: string;
    response?: string;
    videoUrl?: string;
}