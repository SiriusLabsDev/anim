import axios from "axios";
import type { Message, HistoryItem } from "@/lib/types";
import { useAuth } from "@clerk/nextjs";

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

interface MessageResponse extends Omit<Message, 'videoUrl'> {
    video_url: string;
}

const useApi = () => {
    const { getToken } = useAuth();
    async function getAxiosInstance() {
        const token = await getToken();
        const axiosInstance = axios.create({
            baseURL: process.env.NEXT_PUBLIC_API_URL,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return axiosInstance;
    }
    async function getMessagesById(id: string) {
        const axiosInstance = await getAxiosInstance();
        const response = await axiosInstance.get(`/chat/messages/${id}`);
        const messages: Message[] = response.data.map((msg: MessageResponse) => ({
            id: msg.id,
            prompt: msg.prompt,
            response: msg.response,
            videoUrl: msg.video_url,
        }));
        return messages;
    }

    async function getHistory() {
        const axiosInstance = await getAxiosInstance();
        const response = await axiosInstance.get('/chat/history');
        return response.data as HistoryItem[];
    }

    async function getStatus() {
        const axiosInstance = await getAxiosInstance();
        const response = await axiosInstance.get('/chat/running')
        return response.data as StatusResponse;
    }

    async function getVideoUrl(messageId: string) {
        const axiosInstance = await getAxiosInstance();
        const response = await axiosInstance.get(`/chat/message/video/${messageId}`);
        return response.data.video_url as string | undefined;
    }

    async function getCreditsData() {
        const axiosInstance = await getAxiosInstance();
        const response = await axiosInstance.get('/chat/credits');
        const data = {credits: response.data.credits, refreshed_at: undefined as Date | undefined};
        if(response.data.refreshed_at) {
            data.refreshed_at = new Date(response.data.refreshed_at);
        }
        return data;
    }

    async function createAndGetChat(prompt: string): Promise<{ title: string; chatId: string }> {
        const axiosInstance = await getAxiosInstance();
        const response = await axiosInstance.post("/chat/create", { prompt });
        return {
            'title': response.data.title,
            'chatId': response.data.id,
        }
    }

    return {
        getMessagesById,
        getHistory,
        getStatus,
        getVideoUrl,
        getCreditsData,
        createAndGetChat
    }
}

export default useApi;