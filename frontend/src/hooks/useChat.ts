import { useEffect, useRef } from 'react'

const useChat = () => {
    const socketRef = useRef<WebSocket | null>(null);
    const connectSocket = async () => {
        const ws = new WebSocket('ws://localhost:8000/chat/ws?chat_id=1') // TODO: replace with dynamic chat_id
        try {
            const waitForOpen = await new Promise<void>((resolve, reject) => {
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
        } else {
            console.error('WebSocket is not connected');
        }
    }

    const setOnMessage = (callback: (message: string) => void) => {
        if (socketRef.current) {
            socketRef.current.onmessage = (event) => {
                const data = event.data;
                if (data) {
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
    } as const;
}

export default useChat;
