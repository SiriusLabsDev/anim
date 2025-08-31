import React from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { FaArrowUp } from 'react-icons/fa6'
import { usePromptStore } from '@/store/usePromptStore';
import useChatStore from '@/store/useChatStore';

interface Props {
    onSubmit: () => void;
}

const PromptBox: React.FC<Props> = ({ onSubmit }) => {
  const { prompt, setPrompt } = usePromptStore()
  const { processingPrompt } = useChatStore();
  return (
    <div className='flex flex-col h-full w-full rounded-xl border-2 bg-[#141415]'>
        <Input 
        className="border-none bg-transparent px-4 py-6 h-4 my-1 text-[1rem]" 
        placeholder="Ask anim to make..."
        value={prompt}
        onInput={(e) => {
            setPrompt((e.target as HTMLInputElement).value)
        }}
        onKeyDown={(e) => {
            if(processingPrompt) return;

            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                if (prompt !== "") {
                    onSubmit();
                }
            }
        }}
        />
        <div className="flex justify-end my-2 mx-2">
        <Button 
            variant="secondary" disabled={prompt === "" || processingPrompt} 
            className="px-2 py-0 bg-foreground scale-[0.95] disabled:bg-[#1f1f22] border-2"
            onClick={onSubmit}
        >
            <FaArrowUp className="p-0 m-0" color={prompt === "" ? '#ffffff' : "black"}/>
        </Button>
        </div>
    </div>
  )
}

export default PromptBox;
