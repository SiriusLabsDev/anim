import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { FaArrowRightLong } from "react-icons/fa6";

export default function Home() {
  return (
    <div className="bg-background relative min-h-screen z-40">
      {/* Radial dots background */}
      <div 
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }}
      />
      {/* <div 
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage: `radial-gradient(ellipse 70% 30% at top, black 30%, #3ECF8E 60%, transparent 80%)`,
        }}
      /> */}

      
      {/* Main content that will be blurred behind navbar */}
      <div className="relative z-0 pt-[10rem] px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex flex-col gap-0">
            <h1 className="text-[4rem] font-bold flex justify-center">
              <div className="w-[80%] leading-20">
                Prompt and create math
                videos with AI
              </div>
            </h1>
          </div>
          <h4 className="pt-4 text-foreground/60 text-lg">
            Make beautiful animated math explainer videos using just a prompt
          </h4>
        </div>
        <div className="flex justify-center my-8">
          <Button variant={'secondary'} className="px-6 py-6 text-xl rounded-full ">
            Get Started
            <FaArrowRightLong fill="white"/>
          </Button>
        </div>
      </div>
      
      {/* Fixed navbar with backdrop blur */}
      <div className='fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-[90%] max-w-4xl'>
        <div className='bg-black/30 backdrop-blur-md border border-white/20 rounded-lg'>
          <Navbar/> 
        </div>
      </div>
    </div>
  )
}
