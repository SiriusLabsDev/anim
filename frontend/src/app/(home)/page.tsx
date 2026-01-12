"use client"
import { motion } from "motion/react";
import dynamic from "next/dynamic";
import 'plyr/dist/plyr.css';
import HowTo from "@/components/home/how-to";
import Me from "@/components/home/me";
import { useRouter } from "next/navigation";
import CtaButton from "@/components/home/cta-button";

const Plyr = dynamic(() => import("plyr-react"), { ssr: false });

export default function Home() {
  const router = useRouter();
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
    <div className="relative min-h-screen z-40">
        <div className="z-40">

        {/* Main content that will be blurred behind navbar */}
        <motion.div 
          className="relative z-0 px-6"
          variants={container}
          initial="hidden"
          animate="visible"
        >
          {/* Main website text */}
          <motion.div className="max-w-4xl mx-auto text-center">
            <motion.div className="flex flex-col gap-0" variants={item}>
              <h1 className="text-[4rem] font-bold flex justify-center">
                <div 
                  className="w-[80%] leading-20 tracking-tight"
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
            <CtaButton />
          </motion.div>

          {/* Demo video */}
          <div className="w-full py-4 mt-16">
            <div className="w-[min(90%,70rem)] aspect-16/9 mx-auto rounded-lg bg-slate-800/30 ">
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
                  ],
                  poster: '/anim-video-thumbnail.png'
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

    </div>
  )
}
