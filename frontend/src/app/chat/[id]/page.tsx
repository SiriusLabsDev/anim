"use client"

import { useParams } from "next/navigation";
import { usePromptStore } from "@/store/usePromptStore";
import { useCallback, useEffect, useState } from "react";
import PromptBox from "@/components/PromptBox";
import useChat from "@/hooks/useChat";


export default function Page() {
    const params = useParams();
    const id = params.id as string;
    
    const { waitingForMessage } = usePromptStore();
    const handleIncomingMessage = useCallback((message: string) => {
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

    const { connectSocket, sendMessage, setOnMessage } = useChat();

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
                    console.log(message);
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
        <div className="grid grid-cols-12">
            <div className="col-span-6 col-start-4 h-screen bg-[#0F0F10]">
                <div className="flex flex-col h-full m-4">
                    <div className="flex-1 overflow-y-auto p-4">
                        {messages.map((message, index) => (
                            <div key={index} className={`mb-4 ${"text-left"}`}>
                                <div className={`inline-block px-4 py-2 rounded-lg ${message.sender === "user" ? "bg-[#27282D] text-white" : ""}`}>
                                    {message.text}
                                </div>
                            </div>
                        ))}
                    </div>
                    {waitingForMessage && (
                        <div className="text-center text-gray-500">Waiting for a response...</div>
                    )}
                    <div>
                        <PromptBox prompt={prompt} setPrompt={setPrompt} onSubmit={() => {}} />
                    </div> 
                </div>
            </div>
        </div>
    );

}