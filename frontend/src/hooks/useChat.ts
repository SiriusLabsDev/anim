import { RefObject, useEffect } from 'react';
import useChatStore from '@/store/useChatStore';
import useWebSocket from './useWebSocket';
import useResponseState from './chat/useResponseState';
import useChatMessages from './chat/useChatMessages';
import useHistory from './chat/useHistory';


interface ChatOptions {
    chatId: string;
    onVideoReceived: () => void;
    onMessageSendError: (errMsg: string) => void;
    onGenerationError: (errMsg: string) => void;
    divRef: RefObject<HTMLDivElement | null>;               // Reference to the div to scroll into view
}

const useChat = ({ chatId, onVideoReceived, onMessageSendError, onGenerationError, divRef }: ChatOptions) => {
    // Initialize response state and its handlers
    const { 
        responseState, setResponseState, cleanup, writingCodeRef, handleResponseStateOnMessage } = useResponseState({
        onVideoReceived,
        onGenerationError
    });

    const { startGeneration, appendLastPromptToMessages, handleIncomingMessage } = useChatMessages({
        onVideoReceived,
        onGenerationError,
        handleResponseStateOnMessage,
        writingCodeRef
    });

    const { loadingChat } = useHistory({ 
        chatId, onVideoReceived, onGenerationError, cleanup, responseState, setResponseState
    });
    const { connectSocket, socketRef, setOnMessage } = useWebSocket({ chatId, cleanup });

    function sendMessagePrompt(prompt: string) {
        if (responseState !== null) return;

        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(prompt);
            setResponseState("waiting");
            socketRef.current.onerror = () => {
                cleanup();
                onGenerationError("An error occurred.");
            }
        } else {
            console.error('WebSocket is not connected');
            cleanup();
        }
    }

    useEffect(() => {
        const handleChatGeneration = async () => {
            if (!startGeneration) return;

            console.log("here", startGeneration);
            try {
                // 1. Prepare UI
                const lastPrompt = appendLastPromptToMessages(() => {
                    divRef.current?.scrollIntoView({ behavior: 'smooth' });
                });
                if (!lastPrompt) return;

                // 2. Connect WebSocket
                const ws = await connectSocket();

                // 3. Setup WebSocket event handlers
                ws.onerror = () => {
                    cleanup();
                    onMessageSendError("Some error occurred. Please try again.");
                }
                ws.onclose = () => {
                    useChatStore.getState().setChatWorkflowRunning(false);

                    if(responseState && ["waiting", "writing", "coding"].includes(responseState)) {
                        cleanup();
                        onGenerationError("Server error. Please try again.");
                    }
                }

                // 4. Send prompt and handle incoming message stream
                sendMessagePrompt(lastPrompt);
                setOnMessage((message: string) => {
                    handleIncomingMessage(message);
                });

                useChatStore.getState().setStartGeneration(false);
            } catch (error) {
                console.error(error);
                cleanup();
                onMessageSendError("Failed to send message. Please try again."); // TODO: add from `error.message`
            }
        }

        handleChatGeneration();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [startGeneration]);

    return {
        sendMessagePrompt,
        responseState,
        handleIncomingMessage,
        loadingChat,
    } as const;
}

export default useChat;
