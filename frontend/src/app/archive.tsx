"use client"
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { FaArrowRightLong } from "react-icons/fa6";
import { motion, stagger } from "motion/react";
import { Card } from "@/components/ui/card";
import Pricing from "@/components/home/pricing";
import dynamic from "next/dynamic";
import 'plyr/dist/plyr.css';
import About from "@/components/home/about";
import Footer from "@/components/home/footer";
import { cn } from "@/lib/utils";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import HowTo from "@/components/home/how-to";
import Me from "@/components/home/me";

const Plyr = dynamic(() => import("plyr-react"), { ssr: false });

export default function Home() {
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1 // Stagger by 0.1 seconds
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

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
        <div className="z-40">

        {/* Main content that will be blurred behind navbar */}
        <motion.div 
          className="relative z-0 pt-[10rem] px-6"
          variants={container}
          initial="hidden"
          animate="visible"
        >
          {/* Main website text */}
          <motion.div className="max-w-4xl mx-auto text-center">
            <motion.div className="flex flex-col gap-0" variants={item}>
              <h1 className="text-[4rem] font-bold flex justify-center">
                <div 
                  className="w-[80%] leading-20"
                >
                  Prompt and create math
                  videos with AI
                </div>
              </h1>
            </motion.div>
            <motion.h4 className="pt-4 text-foreground/60 text-lg" variants={item}>
              Make beautiful animated math explainer videos using just a prompt
            </motion.h4>
          </motion.div>

          {/* CTA button */}
          <motion.div className="flex justify-center my-8" variants={item}>
              <HoverBorderGradient className="hover:cursor-pointer flex items-center gap-2">
                Get Started
                <FaArrowRightLong fill="white"/>
              </HoverBorderGradient>
          </motion.div>

          {/* Demo video */}
          <div className="w-full py-4 mt-16">
            <div className="w-[min(90%,70rem)] aspect-[16/9] mx-auto rounded-lg bg-slate-800/30 ">
              <Plyr 
                source={{
                  type: 'video',
                  title: 'Demo',
                  sources: [
                    {
                      src: '/demo-anim-video.mp4',
                      type: 'video/mp4',
                      size: 720
                    }
                  ]
                }}
              />
            </div>
          </div>

          <div className="w-2/3 mx-auto my-12">
              <HowTo />
          </div>

          <div className="w-[min(90%,63rem)] mx-auto my-16">
              <Me />
          </div>

          {/* Pricing */}

        </motion.div>
      </div>

      <div 
        className={cn(
          "relative z-50",
          // "border-t-2",
          "bg-[linear-gradient(to_bottom,transparent,theme(backgroundColor.black/94%))]",
        )}
      >
        <Footer />
      </div>
      
      {/* Fixed navbar with backdrop blur */}
      <div className='fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-[90%] max-w-4xl'>
        <motion.div 
          className='bg-black/30 backdrop-blur-md border border-white/20 rounded-full'
          variants={item}
          initial="hidden"
          animate="visible"
          >
          <Navbar/> 
        </motion.div>
      </div>
    </div>
  )
}
