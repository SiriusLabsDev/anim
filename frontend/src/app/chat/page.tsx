"use client"

import { useState  } from "react"
import { usePromptStore } from "@/store/usePromptStore"
import { useRouter } from "next/navigation"
import PromptBox from "@/components/PromptBox"

// type LoadingState = "idle" | "generating-outline" | "generating-video" | "complete"

async function getTitle(prompt: string): Promise<string> {
  console.log(prompt)
  return "Random title"
}

export default function ChatPage() {
  const [prompt, setPrompt] = useState<string>("");
  const router = useRouter();

  const onSubmit = () => {
    try {
      // get title
      const title = getTitle(prompt);
      const id = "random-id";
      const { setLastPrompt, setWaitingForMessage } = usePromptStore.getState();

      setLastPrompt(prompt);
      setWaitingForMessage(true);
      router.push(`/chat/${id}`);
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
          <PromptBox prompt={prompt} setPrompt={setPrompt} onSubmit={onSubmit}/>
        </div>
      </div>
    </div>
  )
}