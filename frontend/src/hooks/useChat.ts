import { useCallback, useEffect, useRef, useState } from 'react'
import { getMessagesById, getStatus } from '@/lib/api';
import useChatStore from '@/store/useChatStore';
import { usePromptStore } from '@/store/usePromptStore';
import useWebSocket from './useWebSocket';

type messageState = "waiting" | "writing" | "coding" | "generating"

interface ChatOptions {
    chatId: string;
    onVideoReceived: () => void;
    onMessageSendError: (errMsg: string) => void;
}
const useChat = ({ chatId, onVideoReceived, onMessageSendError }: ChatOptions) => {

    const [loadingChat, setLoadingChat] = useState(false);
    const [responseState, setResponseState] = useState<messageState | null>(null);
    const cleanup = () => {
        useChatStore.getState().setProcessingPrompt(false);
        setResponseState(null);
    };

    const { connectSocket, socketRef, setOnMessage } = useWebSocket({ chatId, cleanup });

    // Chat History
    const setMessagesOnPage = useCallback(async () => {
        try {
            setLoadingChat(true);
            const messages = await getMessagesById(chatId);
            useChatStore.getState().setMessages(messages);
        } catch (error) {
            console.error(error);
        }
        finally {
            setLoadingChat(false);
        }
    }, [chatId]);

    const writingCodeRef = useRef<boolean>(false);

    const sendMessage = (message: string) => {
        if (socketRef.current) {
            socketRef.current.send(message);
            setResponseState("waiting");
        } else {
            console.error('WebSocket is not connected');
            setResponseState(null);
        }
    }

    const handleIncomingMessage = useCallback((message: string) => {
        console.log("message: ", message, message.includes("`"))

        if (responseState === "waiting") {
            setResponseState("writing");
        }
        
        if(message.includes("```")) {
            setResponseState("coding");
        }
        else if (message === "<done/>") {
            setResponseState("generating");
            return;
        }
        else if (message == "<queued/>") {
            // poll for status updates
            let intervalId: NodeJS.Timeout | undefined = undefined;

            intervalId = setInterval(async () => {
                const statusInfo = await getStatus();
                if (!statusInfo || statusInfo.status === "completed") {
                    setResponseState(null);
                    clearInterval(intervalId);

                    onVideoReceived();
                }
            }, 3 * 1000);
        }
        
        if (writingCodeRef.current) {
            return;
        }

        if (message.includes("```python") || message.includes("```py")) {
            writingCodeRef.current = true;
            if (message.includes("```py")) {
                message = message.split("```py")[0];
            } else {
                message = message.split("```python")[0];
            }
        }

        const prevMessages = useChatStore.getState().messages;
        const newMessages = [...prevMessages];
        const lastMessageIndex = newMessages.length - 1;

        if (lastMessageIndex >= 0) {
            const prevResponse = newMessages[lastMessageIndex].response || "";
            newMessages[lastMessageIndex] = {
                id: newMessages[lastMessageIndex].id,
                prompt: newMessages[lastMessageIndex].prompt,
                response: prevResponse + message
            };
        }
        useChatStore.getState().setMessages(
            newMessages
        );
    }, [responseState, onVideoReceived]);


    const { startGeneration } = usePromptStore();
    useEffect(() => {
        const handleChatGeneration = async () => {
            if (startGeneration) {
                usePromptStore.getState().setStartGeneration(false);
                try {
                    throw new Error("Testing");
                    const { lastPrompt, setLastPrompt } = usePromptStore.getState();
                    if (lastPrompt.trim() === "") return;

                    const {setMessages, messages: prevMessages} = useChatStore.getState();
                    const newMessages = [...prevMessages, {id: "random", prompt: lastPrompt, response: undefined}];

                    setMessages(newMessages);
                    setLastPrompt("");     

                    await connectSocket(); 

                    setMessages([
                        ...newMessages.slice(0, newMessages.length-1),
                        {...newMessages[newMessages.length - 1], response: ""}
                    ]);

                    sendMessage(lastPrompt);

                    setOnMessage((message: string) => {
                        handleIncomingMessage(message);
                    });
                } catch (error) {
                    console.error(error);

                    cleanup();
                    onMessageSendError("Failed to send message. Please try again."); // TODO: add from `error.message`
                }

                // TODO: scroll to the bottom of the chat
            }
        }

        handleChatGeneration();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [startGeneration]);

    useEffect(() => {
        const { startGeneration } = usePromptStore.getState();
        if (!startGeneration) {
            // Handle the case where generation has started
            setMessagesOnPage();
        }
    }, [setMessagesOnPage]);

    return {
        connectSocket,
        setOnMessage,
        sendMessage,
        responseState,
        handleIncomingMessage,
        loadingChat,
    } as const;
}

export default useChat;
