import React from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { FaArrowUp } from 'react-icons/fa6'
import useChatStore from '@/store/useChatStore';
import { Spinner } from './ui/spinner';

interface Props {
    onSubmit: () => void;
    mainPage?: boolean
}

const PromptBox: React.FC<Props> = ({ onSubmit, mainPage = false }) => {
  const { prompt, setPrompt } = useChatStore()
  const { chatWorkflowRunning, generatingTitle } = useChatStore();
  return (
    <div className={`flex flex-col h-full w-full rounded-xl border-2 ${mainPage ? 'bg-[#101011d7]' : 'bg-[#141415]'}`}>
        <Input 
            className="border-none bg-transparent px-4 py-6 h-4 my-1 text-[1rem]" 
            placeholder="Ask anim to make..."
            value={prompt}
            onInput={(e) => {
                setPrompt((e.target as HTMLInputElement).value)
            }}
            disabled={generatingTitle}
            onKeyDown={(e) => {
                if(chatWorkflowRunning) return;

                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                    if (prompt !== "") {
                        onSubmit();
                    }
                }
            }}
        />
        <div className="flex justify-between my-2 mx-2">
            <p className="text-foreground/50 text-end text-sm mt-auto p-2">
                Powered by 
                <span className="bg-primary text-primary-foreground mx-1 px-1 py-1 rounded-xs">
                    Manim
                </span>
            </p>
            <Button 
                variant="secondary" disabled={prompt === "" || chatWorkflowRunning} 
                className="px-2 py-0 bg-foreground scale-[0.95] disabled:bg-[#1f1f22] border-2"
                onClick={onSubmit}
            >
                {!generatingTitle ? 
                    <FaArrowUp className="p-0 m-0" color={prompt === "" ? '#ffffff' : "black"}/> : 
                    // spinner
                    <div className=''><Spinner size='sm'/></div>
                }
            </Button>
        </div>
    </div>
  )
}

export default PromptBox;
