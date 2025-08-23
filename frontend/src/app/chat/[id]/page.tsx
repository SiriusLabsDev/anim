"use client"

import { useParams } from "next/navigation";
import { usePromptStore } from "@/store/usePromptStore";
import { useCallback, useEffect, useRef, useState } from "react";
import PromptBox from "@/components/PromptBox";
import useChat from "@/hooks/useChat";
import ShinyText from "@/components/ui/shiny-text";


export default function Page() {
    const params = useParams();
    const id = params.id as string;
    
    const { waitingForMessage } = usePromptStore();
    const writingCodeRef = useRef<boolean>(false);

    const handleIncomingMessage = useCallback((message: string) => {
        console.log("message: ", message, message.includes("`"))
        
        if(writingCodeRef.current) {
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

        setMessages(prevMessages => {
            const newMessages = [...prevMessages];
            const lastMessageIndex = newMessages.length - 1;
            
            // Only update if the last message is from assistant
            if (newMessages[lastMessageIndex] && newMessages[lastMessageIndex].sender === "assistant") {
                newMessages[lastMessageIndex] = {
                    ...newMessages[lastMessageIndex],
                    text: newMessages[lastMessageIndex].text + message
                };
            }
            
            return newMessages;
        });
    }, []);

    const [messages, setMessages] = useState([
        { sender: "user", text: "Hello, how are you?" },
        { sender: "assistant", text: "I'm fine, thank you! How can I assist you today?" },
        { sender: "user", text: "What is the weather like today?" },
        { sender: "assistant", text: "The weather is sunny with a high of 25°C." },
        { sender: "user", text: "Can you tell me a joke?" },
        { sender: "assistant", text: "Why did the scarecrow win an award? Because he was outstanding in his field!" },
        { sender: "user", text: "Thank you! That was funny." },
        { sender: "assistant", text: "You're welcome! I'm glad you enjoyed it. If you have any more questions or need assistance, feel free to ask!" },
    ]);

    const [prompt, setPrompt] = useState<string>("");

    const { connectSocket, sendMessage, setOnMessage, responseState } = useChat();

    useEffect(() => {
        if(waitingForMessage) {
            // append the lastPrompt to the messages
            const { lastPrompt, setLastPrompt } = usePromptStore.getState();
            const sendPromptAndFinish = async () => {
                if (lastPrompt.trim() === "") return; // Do not send empty prompts

                setMessages(prevMessages => [
                    ...prevMessages,
                    { sender: "user", text: lastPrompt }
                ]);
                setLastPrompt(""); // Clear the prompt after sending    
                await connectSocket(); // connect the socket after updating messages

                sendMessage(lastPrompt); // send the last prompt
                setMessages(prevMessages => [
                    ...prevMessages,
                    { sender: "assistant", text: ""}
                ]);
                setOnMessage((message: string) => {
                    // add the gotten chunk to the last message
                    handleIncomingMessage(message);
                }) 
            }

            if (lastPrompt) {
                sendPromptAndFinish();
            }
            // scroll to the bottom of the chat
            const chatContainer = document.querySelector('.flex-1.overflow-y-auto.p-4');
            if (chatContainer) {
                chatContainer.scrollTop = chatContainer.scrollHeight;
            }
        }
    }, [waitingForMessage, handleIncomingMessage]);

    return (
        <div className="grid grid-cols-12 bg-[#0F0F10]">
            <div className="col-span-6 col-start-4 h-fit justify-between">
                <div className="flex flex-col h-screen overflow-hidden justify-between">
                    <div className="flex-1 mt-8 overflow-y-auto p-4 max-h-fit">
                        {messages.map((message, index) => (
                            <div key={index} className={`${"text-left"}`}>
                                <div 
                                    className={`inline-block px-4 rounded-lg ${
                                        message.sender === "user" ? "bg-[#27282D] text-white py-2 mb-4" : index !== messages.length - 1 ? "mb-8" : "mb-2"
                                    }`}
                                >
                                    {message.text}
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
                        <PromptBox prompt={prompt} setPrompt={setPrompt} onSubmit={() => {}} />
                    </div> 
                </div>
            </div>
        </div>
    );

}