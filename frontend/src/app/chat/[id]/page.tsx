"use client"

import { useParams } from "next/navigation";
import PromptBox from "@/components/PromptBox";
import useChat from "@/hooks/useChat";
import ShinyText from "@/components/ui/shiny-text";
import useChatStore from "@/store/useChatStore";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getMessagesById } from "@/lib/api";
import { useUser } from "@clerk/nextjs";
import LoadingSkeleton from "./(components)/LoadingSkeleton";
import { toast } from "sonner";
import { usePromptStore } from "@/store/usePromptStore";
import { motion, AnimatePresence } from "motion/react";
import { useRef } from "react";

function AiWorkingAnimation({text }: {text: string}) {
    return (
        <motion.div 
            className="text-left text-gray-500"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            layoutId="ai-working-animation"
        >
            <ShinyText text={text} />
        </motion.div>
    )
}

export default function Page() {
    const params = useParams();
    const id = params.id as string;
    
    const { messages } = useChatStore();

    const onVideoReceived = () => {
        const setMessagesOnPage = async () => {
            const messages = await getMessagesById(id);
            useChatStore.getState().setMessages(messages);
        };
        setMessagesOnPage();
    };

    const onMessageSendError = (errMsg: string) => {
        console.log("displaying toast 🥃");
        toast.error(errMsg);
    }
    // TODO: Change this
    const onGenerationError = (errMsg: string) => {
        toast.error(errMsg);
    }

    const { prompt, setPrompt, setLastPrompt, setStartGeneration } = usePromptStore();
    const { setProcessingPrompt } = useChatStore();

    const onSubmit = () => {
        setProcessingPrompt(true);
        setLastPrompt(prompt);
        setStartGeneration(true);
        setPrompt("");
    }

    const { user } = useUser();

    const divRef = useRef<HTMLDivElement>(null);

    const { responseState, loadingChat } = useChat(
        {chatId: id, onVideoReceived, onMessageSendError, onGenerationError, divRef}
    );

    return (
        <div className="flex justify-center items-center w-full">
            <div className="h-fit justify-between md:min-w-[47rem] max-w-[47rem]">
                <div className="flex flex-col h-screen overflow-hidden justify-between">
                    <div className="flex-1 mt-8 overflow-y-auto max-h-fit">
                        {loadingChat && <LoadingSkeleton />}
                        <AnimatePresence initial={false}>
                            {!loadingChat && messages.map((message, index) => (
                                <div key={index} className={`${"text-left"}`}>
                                    <div className="inline-block px-4">
                                        <div className="flex bg-[#27282D] w-fit rounded-xl text-white py-2 mb-4 pl-2 pr-8">
                                            <div className="bg-[#dfdfdf] text-[#27282D] font-bold rounded-full w-6 h-6 p-4 inline-flex items-center justify-center mr-2">
                                                {user?.firstName?.[0]}
                                            </div>
                                            <motion.div 
                                                className="self-center"
                                                layout
                                                initial={{ opacity: 0, y: 20 }}  // ⬅️ ignored on first render
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 20 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                {message.prompt}
                                            </motion.div>
                                        </div>
                                        {/* Output */}
                                        <div className={`${index === messages.length -1 ? 'min-h-[72vh] mb-2' : 'mb-8'}`}>
                                            {/* Response */}
                                            <div className={`mb-4 tracking-wide px-2`}>
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.response}</ReactMarkdown>
                                            </div>
                                            {index === messages.length -1 && 
                                                <div className="px-2">
                                                    <AnimatePresence>
                                                        {responseState === "waiting" && 
                                                            <AiWorkingAnimation text="Thinking" />
                                                        }
                                                        {responseState === "coding" && 
                                                            <AiWorkingAnimation text="Writing video script" />
                                                        }
                                                        {responseState === "generating" && 
                                                            <AiWorkingAnimation text="Generating video" />
                                                        }
                                                    </AnimatePresence>
                                                </div>
                                            }
                                            {/* Video */}
                                            {message.videoUrl && (
                                                <div className="mt-4 mb-auto">
                                                    <video controls className="w-full rounded-lg">
                                                        <source src={message.videoUrl} type="video/mp4" />
                                                        Your browser does not support video.
                                                    </video>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </AnimatePresence>
                        
                        <div ref={divRef} id="scroller-div"></div>
                    </div>
                    <div className="mb-8">
                        <PromptBox onSubmit={onSubmit} />
                    </div> 
                </div>
            </div>
        </div>
    );

}