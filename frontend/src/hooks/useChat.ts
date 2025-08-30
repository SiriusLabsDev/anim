import { useCallback, useEffect, useRef, useState } from 'react'
import { getMessagesById, getStatus } from '@/lib/api';
import useChatStore from '@/store/useChatStore';
import { usePromptStore } from '@/store/usePromptStore';

type messageState = "waiting" | "writing" | "coding" | "generating"

const useChat = (chatId: string, onVideoReceived: () => void) => {

    // Initialize chat history
    const setMessagesOnPage = useCallback(async () => {
        const messages = await getMessagesById(chatId);
        useChatStore.getState().setMessages(messages);
        console.log("messages set");
    }, [chatId]);

    const socketRef = useRef<WebSocket | null>(null);
    const writingCodeRef = useRef<boolean>(false);
    const [responseState, setResponseState] = useState<messageState | null>(null);

    const connectSocket = async () => {
        const ws = new WebSocket(`ws://localhost:8000/api/chat/ws?chat_id=${chatId}`);
        try {
            await new Promise<void>((resolve, reject) => {
                ws.onopen = () => {
                    console.log('WebSocket connection established')
                    resolve()
                }
                ws.onerror = (error) => {
                    console.error('WebSocket error:', error)
                    reject(error)
                }
            })
            socketRef.current = ws;
        } catch (error) {
            console.error('Error connecting to WebSocket:', error) 
            socketRef.current = null;
        }
    }

    const sendMessage = (message: string) => {
        if (socketRef.current) {
            socketRef.current.send(message);
            setResponseState("waiting");
        } else {
            console.error('WebSocket is not connected');
            setResponseState(null);
        }
    }

    const setOnMessage = (callback: (message: string) => void) => {
        if (socketRef.current) {
            socketRef.current.onmessage = (event) => {
                const data = event.data;
                if (data) {
                    if (responseState === "waiting") {
                        setResponseState("writing");
                    }
                    
                    if(data.includes("```")) {
                        setResponseState("coding");
                    }
                    else if (data === "<done/>") {
                        setResponseState("generating");
                        return;
                    }
                    else if (data == "<queued/>") {
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

                    callback(data);
                } else {
                    console.error('Received unexpected data:', data);
                }
            }
        } else {
            console.error('WebSocket is not connected');
        }
    }

    const handleIncomingMessage = useCallback((message: string) => {
        console.log("message: ", message, message.includes("`"))
        
        if (writingCodeRef.current) {
            return;             // TODO: change this later
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
    }, []);


    const { waitingForMessage } = usePromptStore();
    useEffect(() => {
        const handle = async () => {
            await setMessagesOnPage();
            const setMessages = useChatStore.getState().setMessages;
            if(waitingForMessage) {
                // append the lastPrompt to the messages
                const { lastPrompt, setLastPrompt } = usePromptStore.getState();
                const sendPromptAndFinish = async () => {
                    if (lastPrompt.trim() === "") return;

                    const prevMessages = useChatStore.getState().messages;
                    const newMessages = [...prevMessages, {id: "random", prompt: lastPrompt, response: undefined}]

                    setMessages(newMessages);
                    console.log("got here");
                    setLastPrompt(""); // Clear the prompt after sending    
                    await connectSocket(); // connect the socket after updating messages

                    setMessages([
                        ...newMessages.slice(0, newMessages.length-1),
                        {...newMessages[newMessages.length - 1], response: ""}
                    ]);
                    console.log("sending message: ", lastPrompt);

                    sendMessage(lastPrompt); // send the last prompt
                    setOnMessage((message: string) => {
                        // add the gotten chunk to the last message
                        handleIncomingMessage(message);
                    }) 
                }

                if (lastPrompt) {
                    sendPromptAndFinish();
                }
                // TODO: scroll to the bottom of the chat
            }
            else {
                await setMessagesOnPage();
            }
        }
        handle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [waitingForMessage, handleIncomingMessage]);

    return {
        connectSocket,
        setOnMessage,
        sendMessage,
        responseState,
        handleIncomingMessage,
    } as const;
}

export default useChat;
