"use client"

import { usePromptStore } from "@/store/usePromptStore"
import { useRouter } from "next/navigation"
import PromptBox from "@/components/PromptBox"

import { axiosInstance } from "@/lib/api"
import useChatStore from "@/store/useChatStore"
import { useEffect } from "react"
import { useHistoryStore } from "@/store/useHistoryStore"


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
    const { setTitle, setProcessingPrompt, setFreezeInput } = useChatStore.getState();
    try {
      // get title
      setProcessingPrompt(true);
      setFreezeInput(true);

      const { title, chatId } = await createAndGetChat(prompt);
      const { setLastPrompt, setStartGeneration } = usePromptStore.getState();

      setLastPrompt(prompt);
      setStartGeneration(true);
      setTitle(title);
      
      router.push(`/chat/${chatId}`);
      setPrompt("");

      const { history: prevHistory, setHistory } = useHistoryStore.getState();
      setHistory([{ id: chatId, title }, ...prevHistory]);

    } catch (error) {
      console.error("Error submitting prompt:", error);
    } finally {
      setFreezeInput(false);
    }
  }


  return (
    <div className="relative flex flex-col justify-center items-center h-screen w-full bg-black">
      {/* <div 
        className="absolute inset-0 opacity-60 z-10"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }}
      /> */}
      <div className="flex flex-col gap-6 z-30">
        <h2 className="text-[3rem] font-bold text-center">
          What{`'`}s on your mind?
        </h2>
        <div className="flex flex-col justify-between min-h-28 w-[40rem]">
          <PromptBox onSubmit={onSubmit} mainPage={true} />
        </div>
      </div>
    </div>
  )
}