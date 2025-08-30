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