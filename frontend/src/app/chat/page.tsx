"use client"

import { useRouter } from "next/navigation"
import PromptBox from "@/components/PromptBox"

import { axiosInstance } from "@/lib/api"
import useChatStore from "@/store/useChatStore"
import { useEffect } from "react"
import { useHistoryStore } from "@/store/useHistoryStore"
import { AxiosError } from "axios"
import { toast } from "sonner"


async function createAndGetChat(prompt: string): Promise<{ title: string; chatId: string }> {
  const response = await axiosInstance.post("/chat/create", { prompt });
  return {
    'title': response.data.title,
    'chatId': response.data.id,
  }
}

export default function ChatPage() {
  const {prompt, setPrompt} = useChatStore();
  const router = useRouter();

  useEffect(() => {
    const { setTitle, setMessages } = useChatStore.getState();
    setTitle(undefined);
    setMessages([]);
  }, [])
  
  const onSubmit = async () => {
    const { 
      setTitle, setChatWorkflowRunning, 
      setGeneratingTitle, setLastPrompt, setStartGeneration
    } = useChatStore.getState();

    try {
      setChatWorkflowRunning(true);
      setGeneratingTitle(true);

      const { title, chatId } = await createAndGetChat(prompt);

      setLastPrompt(prompt);
      setStartGeneration(true);       // to signal the chat workflow to start
      setTitle(title);
      
      router.push(`/chat/${chatId}`);
      setPrompt("");

      const { history: prevHistory, setHistory } = useHistoryStore.getState();
      setHistory([{ id: chatId, title }, ...prevHistory]);

    } catch (error) {
      console.error("Error submitting prompt:", error);

      let errorMessage = "Error sending message.";
      if(error instanceof AxiosError) {
        errorMessage = error.response?.data.detail;
      }

      toast.error(errorMessage);

      setChatWorkflowRunning(false);
      setStartGeneration(false);
      setTitle(undefined);

    } finally {
      setGeneratingTitle(false);
    }
  }


  return (
    <div className="relative flex flex-col justify-center items-center h-screen w-full bg-black">
      <div className="flex flex-col gap-6 z-30 w-full">
        <h2 className="text-[2rem] sm:text-[2rem] md:text-[3rem] font-bold text-center">
          What{`'`}s on your mind?
        </h2>
        <div className="flex flex-col justify-between md:min-h-28 w-[min(90%,40rem)] lg:w-[40rem] mx-auto">
          <PromptBox onSubmit={onSubmit} mainPage={true} />
        </div>
      </div>
    </div>
  )
}