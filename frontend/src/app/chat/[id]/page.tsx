"use client"

import { useParams } from "next/navigation";
import PromptBox from "@/components/PromptBox";
import useChat from "@/hooks/useChat";
import ShinyText from "@/components/ui/shiny-text";
import useChatStore from "@/store/useChatStore";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getMessagesById } from "@/lib/api";

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
    const { responseState } = useChat(id, onVideoReceived);

    return (
        <div className="flex justify-center items-center w-full">
            <div className="h-fit justify-between md:min-w-[45rem] max-w-[45rem]">
                <div className="flex flex-col h-screen overflow-hidden justify-between">
                    <div className="flex-1 mt-8 overflow-y-auto max-h-fit">
                        {messages.map((message, index) => (
                            <div key={index} className={`${"text-left"}`}>
                                <div className="inline-block px-4">
                                    <div className="bg-[#27282D] w-fit rounded-lg text-white py-2 mb-4 px-4">
                                        {message.prompt}
                                    </div>
                                    <div className={index != messages.length - 1 ? "mb-8" : "mb-2"}>
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.response}</ReactMarkdown>
                                    </div>
                                    {message.videoUrl && (
                                        <div className="mb-4">
                                            <video controls className="w-full rounded-lg">
                                                <source src={message.videoUrl} type="video/mp4" />
                                                Your browser does not support video.
                                            </video>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        <div className="px-4">
                            {responseState === "waiting" && <div className="text-left text-gray-500"><ShinyText text="Thinking" /></div>}
                            {responseState === "coding" && <div className="text-left text-gray-500"><ShinyText text="Writing video script" /></div>}
                            {responseState === "generating" && <div className="text-left text-gray-500"><ShinyText text="Generating video" /></div>}
                        </div>
                    </div>
                    <div className="mb-8">
                        <PromptBox onSubmit={() => {}} />
                    </div> 
                </div>
            </div>
        </div>
    );

}