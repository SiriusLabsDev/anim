import useChatStore from "@/store/useChatStore";
import { RefObject, useCallback, useRef } from "react";
import useResponseState from "./useResponseState";
import { messageState } from "@/lib/types";

interface UseChatMessages {
    onVideoReceived: () => void;
    onGenerationError: (errMsg: string) => void;
    handleResponseStateOnMessage: (message: string) => boolean;
    responseState: messageState | null;
    writingCodeRef: RefObject<boolean>;
}

const useChatMessages = ({ onVideoReceived, onGenerationError, handleResponseStateOnMessage, responseState, writingCodeRef }: UseChatMessages) => {
    const { startGeneration, appendLastPromptToMessages } = useChatStore();

    const handleIncomingMessage = useCallback((message: string) => {
        console.log("message: ", message, message.includes("`"))

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
    }, [responseState, onVideoReceived, onGenerationError]);
    return { 
        startGeneration, 
        appendLastPromptToMessages,
        handleIncomingMessage
    };
}

export default useChatMessages;
