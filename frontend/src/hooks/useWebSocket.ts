import { useRef } from "react"

interface WebSocketOptions {
    chatId: string;
    cleanup: () => void;
}

const useWebSocket = ({ chatId, cleanup }: WebSocketOptions) => {
    const socketRef = useRef<WebSocket | null>(null);

    const connectSocket = async () => {
        const ws = new WebSocket(`${process.env.NEXT_PUBLIC_BASE_SOCKET_URL}/chat/ws?chat_id=${chatId}`);
        await new Promise<void>((resolve, reject) => {
            ws.onopen = () => {
                console.log('WebSocket connection established')
                resolve();
            }
            ws.onerror = (error) => {
                console.error('WebSocket error:', error)
                cleanup();
                reject(error);
            }
        })
        socketRef.current = ws;
        return ws;
    }

    const setOnMessage = (callback: (message: string) => void) => {
        if(!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
            throw new Error('WebSocket is not connected/open');
        }

        socketRef.current.onmessage = (event) => {
            const data = event.data;
            if (data) {
                callback(data);
            } else {
                console.error('Received unexpected data:', data);
            }
        }
    }

    return {
        connectSocket,
        socketRef,
        setOnMessage,
    } as const;
}

export default useWebSocket;