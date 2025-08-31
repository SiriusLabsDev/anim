"use client"

import { usePromptStore } from "@/store/usePromptStore"
import { useRouter } from "next/navigation"
import PromptBox from "@/components/PromptBox"

import { axiosInstance } from "@/lib/api"
import useChatStore from "@/store/useChatStore"
import { useEffect } from "react"


async function createAndGetChat(prompt: string): Promise<{ title: string; chatId: string }> {
  const response = await axiosInstance.post("/chat/create", { prompt });
  return {
    'title': response.data.title,
    'chatId': response.data.id,
  }
}

export default function ChatPage() {
  const {prompt, setPrompt} = usePromptStore();
  const router = useRouter();

  useEffect(() => {
    const { setTitle, setMessages } = useChatStore.getState();
    setTitle(undefined);
    setMessages([]);
  }, [])

  const onSubmit = async () => {
    try {
      // get title
      const { setTitle, setProcessingPrompt } = useChatStore.getState();
      setProcessingPrompt(true);
      const { title, chatId } = await createAndGetChat(prompt);
      const { setLastPrompt, setWaitingForMessage } = usePromptStore.getState();

      setLastPrompt(prompt);
      setWaitingForMessage(true);
      setTitle(title);
      
      router.push(`/chat/${chatId}`);
      setPrompt("");

    } catch (error) {
      console.error("Error submitting prompt:", error);  
    }
  }


  return (
    <div className="relative flex flex-col justify-center items-center h-screen w-full">
      <div 
        className="absolute inset-0 opacity-60 z-10"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }}
      />
      <div className="flex flex-col gap-6 z-30">
        <h2 className="text-[3rem] font-bold text-center">
          What{`'`}s on your mind?
        </h2>
        <div className="flex flex-col justify-between min-h-28 w-[40rem]">
          <PromptBox onSubmit={onSubmit}/>
        </div>
      </div>
    </div>
  )
}