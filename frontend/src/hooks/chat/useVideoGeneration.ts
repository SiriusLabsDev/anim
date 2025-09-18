import useApi from '@/hooks/useApi';

interface VideoGenerationOptions {
    onVideoReceived: () => void;
    cleanup: () => void;
    onGenerationError: (errMsg: string) => void;
}
const useVideoGeneration = ({onVideoReceived, cleanup, onGenerationError}: VideoGenerationOptions) => {
    const { getStatus } = useApi();
    const runStatusPollsForVideoGeneration = () => {
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
    }
    return { runStatusPollsForVideoGeneration };
}

export default useVideoGeneration;