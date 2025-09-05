"use client";
import { motion } from "motion/react";
import Navbar from "@/components/Navbar";
import { cn } from "@/lib/utils";
import Footer from "@/components/home/footer";

export default function Layout({children}: {children: React.ReactNode}) {
  const item = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };
  return (
    <div className="relative">
        <div 
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
            backgroundSize: '24px 24px'
          }}
        />
        <div className="pt-[10rem] min-h-screen flex flex-col justify-between">
            {children}
            <div 
                className={cn(
                "relative z-50",
                "bg-[linear-gradient(to_bottom,transparent,theme(backgroundColor.black/94%))]",
                "flex mt-auto"
                )}
            >
                <Footer />
            </div>
        </div>

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
  );
}
