import { useEffect, useState } from 'react';
import useChatStore from '@/store/useChatStore';
import { useQuery } from '@tanstack/react-query';
import useVideoGeneration from './useVideoGeneration';
import { messageState } from '@/lib/types';
import useApi from '@/hooks/useApi';

interface UseHistory {
    chatId: string;
    onVideoReceived: () => void;
    onGenerationError: (errMsg: string) => void;
    cleanup: () => void;
    responseState: messageState | null;
    setResponseState: (state: messageState | null) => void;
}

const useHistory = ({ chatId, onVideoReceived, onGenerationError, cleanup, responseState, setResponseState }: UseHistory) => {
    const { getMessagesById, getStatus } = useApi();
    const { startGeneration, chatWorkflowRunning } = useChatStore.getState();
    const { runStatusPollsForVideoGeneration } = useVideoGeneration({ onVideoReceived, cleanup, onGenerationError });

    // used to stop the queryFn from running if the component mounted
    // with startGeneration = True
    const [temp, setTemp] = useState(false);

    // TODO: find a better fix
    useEffect(() => {
        if(startGeneration) {
            setTemp(true);
        }
    }, [])

    const { data: historyMessages, isLoading: loadingChat, error} = useQuery({
        queryKey: ['messages', chatId],
        queryFn: async () => {
           console.log(startGeneration, chatWorkflowRunning, responseState);
           return await getMessagesById(chatId); 
        },
        // TODO: fix this responseState dependency
        enabled: !startGeneration && !chatWorkflowRunning && !responseState && !temp, // Only run if not generating
        refetchOnWindowFocus: true,
    })

    useEffect(() => {
        if (!historyMessages) return;
        const setupHistoryMessagesWithState = async () => {
            useChatStore.getState().setMessages(historyMessages);

            const status = await getStatus()

            if(status && (status.status === "processing" || status.status === "queued")) {
                if (status.chat_id === chatId) {
                    setResponseState("generating");
                    runStatusPollsForVideoGeneration();
                }
            }
        }
        setupHistoryMessagesWithState();
    }, [historyMessages])

    return { historyMessages, loadingChat } as const;
}

export default useHistory;
