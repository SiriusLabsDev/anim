"use client"

import { useState  } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FaArrowUp } from "react-icons/fa6"

type LoadingState = "idle" | "generating-outline" | "generating-video" | "complete"

export default function ChatPage() {

  const downloadVideo = () => {
  }

  const [prompt, setPrompt] = useState<string>("");

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
        <div className="flex flex-col justify-between bg-[#141415] min-h-28 w-[40rem] rounded-xl border-2">
          <Input 
            className="border-none bg-transparent px-4 py-6 h-4 my-1 text-[1rem]" 
            placeholder="Ask anim to make..."
            value={prompt}
            onInput={(e) => {
              setPrompt((e.target as HTMLInputElement).value)
            }}
          />
          <div className="flex justify-end my-2 mx-2">
            <Button variant="secondary" disabled={prompt === ""} 
              className="px-2 py-0 bg-foreground scale-[0.95] disabled:bg-[#1f1f22] border-2"
            >
              <FaArrowUp className="p-0 m-0" color={prompt === "" ? '#ffffff' : "black"}/>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}