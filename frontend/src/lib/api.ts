import axios from "axios";
import type { Message, HistoryItem } from "./types";

type Status = "queued" | "processing" | "completed" | "failed";

interface StatusResponse {
    task_id: string,
    user_id: string,
    chat_id: string,
    message_id: string,
    status: Status,
    created_at: number,
    instance_id: string,
    started_at?: number,
    completed_at?: number,
    result?: string,
    error?: string,
}

export const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true,
});

interface MessageResponse extends Omit<Message, 'videoUrl'> {
    video_url: string;
}

export async function getMessagesById(id: string) {
    console.log("Fetching messages for chat ID:", id);
    const response = await axiosInstance.get(`/chat/messages/${id}`);
    const messages: Message[] = response.data.map((msg: MessageResponse) => ({
        id: msg.id,
        prompt: msg.prompt,
        response: msg.response,
        videoUrl: msg.video_url,
    }));
    return messages;
}

export async function getHistory() {
    const response = await axiosInstance.get('/chat/history');
    return response.data as HistoryItem[];
}

export async function getStatus() {
    const response = await axiosInstance.get('/chat/running')
    return response.data as StatusResponse;
}

export async function getVideoUrl(messageId: string) {
    const response = await axiosInstance.get(`/chat/message/video/${messageId}`);
    return response.data.video_url as string | undefined;
}

export async function getCreditsData() {
    const response = await axiosInstance.get('/chat/credits');
    const data = {credits: response.data.credits, refreshed_at: undefined as Date | undefined};
    if(response.data.refreshed_at) {
        data.refreshed_at = new Date(response.data.refreshed_at);
    }
    return data;
}