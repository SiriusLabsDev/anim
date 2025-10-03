import useChatStore from "@/store/useChatStore";
import { RefObject, useCallback, useRef } from "react";

interface UseChatMessages {
    onVideoReceived: () => void;
    onGenerationError: (errMsg: string) => void;
    handleResponseStateOnMessage: (message: string) => boolean;
    writingCodeRef: RefObject<boolean>;
}

const useChatMessages = ({ onVideoReceived, onGenerationError, handleResponseStateOnMessage, writingCodeRef }: UseChatMessages) => {
    const { startGeneration, appendLastPromptToMessages } = useChatStore();

    const handleIncomingMessage = useCallback((message: string) => {

        const shouldContinue = handleResponseStateOnMessage(message);
        if (!shouldContinue) return;

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

        // Add messages to update state
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
    }, [onVideoReceived, onGenerationError]);
    return { 
        startGeneration, 
        appendLastPromptToMessages,
        handleIncomingMessage
    };
}

export default useChatMessages;
