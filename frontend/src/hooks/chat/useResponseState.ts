import { useCallback, useRef, useState } from "react";
import useVideoGeneration from "./useVideoGeneration";
import useChatStore from "@/store/useChatStore";
import type { messageState } from "@/lib/types";


interface ResponseStateOptions {
    onGenerationError: (errMsg: string) => void;
    onVideoReceived: () => void;
}

const useResponseState = ({ onGenerationError, onVideoReceived }: ResponseStateOptions) => {
    const [responseState, setResponseState] = useState<messageState | null>(null);
    const writingCodeRef = useRef<boolean>(false);

    const cleanup = useCallback(() => {
        useChatStore.getState().setChatWorkflowRunning(false);
        setResponseState(null);
        writingCodeRef.current = false;
    }, [])

    const { runStatusPollsForVideoGeneration } = useVideoGeneration({ 
        onVideoReceived,
        cleanup,
        onGenerationError
    });

    const handleResponseStateOnMessage  = useCallback((message: string) => {
        if (responseState === "waiting") {
            setResponseState("writing");
        }
        
        if(message.includes("```")) {
            setResponseState("coding");
        }
        else if (message === "<done/>") {
            setResponseState(null);
            return false;
        }
        else if (message === "<failed/>") {
            cleanup();
            onGenerationError("Video generation failed");
            return false;
        }
        else if (message === "<queued/>") {
            // poll for status updates
            setResponseState("generating");
            runStatusPollsForVideoGeneration();
            return false;
        }

        return true;
    }, [responseState, onGenerationError, onVideoReceived, cleanup, runStatusPollsForVideoGeneration]);

    return { 
        responseState, 
        setResponseState, 
        handleResponseStateOnMessage, 
        writingCodeRef,
        cleanup
    } as const;
}

export default useResponseState;
