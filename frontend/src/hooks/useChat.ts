import { useEffect, useRef, useState } from 'react'

type messageState = "waiting" | "writing" | "coding" | "generating"

const useChat = () => {
    const socketRef = useRef<WebSocket | null>(null);
    const [responseState, setResponseState] = useState<messageState | null>(null);

    const connectSocket = async () => {
        const ws = new WebSocket('ws://localhost:8000/api/chat/ws?chat_id=1') // TODO: replace with dynamic chat_id
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
                    
                    if (data === "<done/>") {
                        setResponseState("generating");
                    }

                    if(data.includes("```")) {
                        setResponseState("coding");
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

    return {
        connectSocket,
        setOnMessage,
        sendMessage,
        responseState,
    } as const;
}

export default useChat;
