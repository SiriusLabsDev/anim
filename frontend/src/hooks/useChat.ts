import { RefObject, useCallback, useEffect, useRef, useState } from 'react'
import { getMessagesById, getStatus } from '@/lib/api';
import useChatStore from '@/store/useChatStore';
import { usePromptStore } from '@/store/usePromptStore';
import useWebSocket from './useWebSocket';

type messageState = "waiting" | "writing" | "coding" | "generating"

interface ChatOptions {
    chatId: string;
    onVideoReceived: () => void;
    onMessageSendError: (errMsg: string) => void;
    onGenerationError: (errMsg: string) => void;
    divRef: RefObject<HTMLDivElement | null>; // Reference to the div to scroll into view
}
const useChat = ({ chatId, onVideoReceived, onMessageSendError, onGenerationError, divRef }: ChatOptions) => {

    const [loadingChat, setLoadingChat] = useState(false);
    const [responseState, setResponseState] = useState<messageState | null>(null);
    const cleanup = () => {
        useChatStore.getState().setProcessingPrompt(false);
        setResponseState(null);
        writingCodeRef.current = false;
    };

    const { connectSocket, socketRef, setOnMessage } = useWebSocket({ chatId, cleanup });

    // Chat History
    const setMessagesOnPage = useCallback(async () => {
        try {
            console.log("setting messages")
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

    const sendMessagePrompt = (prompt: string) => {
        if (responseState !== null) return;

        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(prompt);
            setResponseState("waiting");
            socketRef.current.onerror = () => {
                cleanup();
                onGenerationError("An error occurred.");
            }
            socketRef.current.onclose = () => {
                if(responseState && ["waiting", "writing", "coding"].includes(responseState)) {
                    cleanup();
                }
            }
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
            setResponseState(null);
            return;
        }
        else if (message === "<failed/>") {
            cleanup();
            onGenerationError("Video generation failed");
        }
        else if (message === "<queued/>") {
            // poll for status updates
            setResponseState("generating");
            let intervalId: NodeJS.Timeout | undefined = undefined;

            intervalId = setInterval(async () => {
                const statusInfo = await getStatus();
                if (!statusInfo || statusInfo.status === "completed") {
                    clearInterval(intervalId);
                    cleanup();

                    onVideoReceived();
                }
                else if(statusInfo.status === "failed") {
                    cleanup();
                    onGenerationError("Video generation failed");
                }
            }, 3 * 1000);
            return;
        }

        if (writingCodeRef.current) {
            if(message.includes("```")) {
                writingCodeRef.current = false;
            }
            return;
        }

        if (message.includes("```")) {
            writingCodeRef.current = true;
            message = message.split("```")[0];
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
    }, [responseState, onVideoReceived, onGenerationError]);

    const { startGeneration } = usePromptStore();

    useEffect(() => {
        if (!startGeneration) {
            // Handle the case where generation has started
            console.log("startGeneration: ", startGeneration);
            setMessagesOnPage();
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const handleChatGeneration = async () => {
            if (!startGeneration) return;

            console.log("here", startGeneration);
            try {
                usePromptStore.getState().setStartGeneration(false);
                const { lastPrompt, setLastPrompt } = usePromptStore.getState();
                if (lastPrompt.trim() === "") return;

                const {setMessages, messages: prevMessages} = useChatStore.getState();
                // const newMessages = [...prevMessages, {id: "random", prompt: lastPrompt, response: undefined}];
                const newMessages = [...prevMessages, {id: "random", prompt: lastPrompt, response: ""}];

                setMessages(newMessages);
                setLastPrompt("");     

                console.log(divRef.current);

                setTimeout(() => {
                    divRef.current?.scrollIntoView({ behavior: 'smooth' });
                }, 100);

                await connectSocket(); 

                // setMessages([
                //     ...newMessages.slice(0, newMessages.length-1),
                //     {...newMessages[newMessages.length - 1], response: ""}
                // ]);

                sendMessagePrompt(lastPrompt);

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

        handleChatGeneration();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [startGeneration]);

    useEffect(() => {
        useChatStore.getState().setProcessingPrompt(responseState !== null);
    }, [responseState])


    return {
        connectSocket,
        setOnMessage,
        sendMessagePrompt,
        responseState,
        handleIncomingMessage,
        loadingChat,
    } as const;
}

export default useChat;
