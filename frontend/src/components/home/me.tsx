"use client"

import React from "react";
import AnimationContainer from "../ui/animation-container";
import { cn } from "@/lib/utils";
import Image from "next/image";

const Me = () => {
  return (
    <div>
      <AnimationContainer delay={0.1}>
        <div className="mx-auto flex w-full max-w-2xl flex-col items-center justify-center py-8 lg:items-center">
          {/* <MagicBadge title="The Process" /> */}
          <h2 className="!leading-[1.1] mt-6 text-center font-heading font-medium text-3xl text-foreground md:text-5xl lg:text-center">
            Your friendly neighbourhood developer behind Anim
          </h2>
          <p className="mt-4 max-w-lg text-center text-lg text-muted-foreground lg:text-center">
            Just another developer building cool stuff
          </p>
        </div>
      </AnimationContainer>
      <AnimationContainer delay={0.2}>
        <div className={cn(
          "flex flex-col md:flex-row gap-2 md:gap-8 rounded-3xl hover:shadow-2xl",
          "mt-8",
          "bg-black/50",
          "group hover:border-r-2 transition-all duration-200"
        )}>
          <div>
            <Image 
              src={`/shrey-dev.png`}
              alt="Shrey Singh"
              height={400} 
              width={400}
              className="rounded-3xl"
              style={{
                filter: "grayscale(60%)"
              }}
            /> 
          </div>
          <div className="flex flex-col pl-4 md:pl-12 rounded-r-3xl py-4 pr-8 group-hover:border-b-2 transition-all duration-200">
            <h2 className="text-xl lg:text-2xl font-semibold">Shrey Singh</h2>
            <p className="text-xs text-foreground/60 mb-4">Developer</p>
            <p className="text-foreground/85">Sole developer behind Anim. Thinks this a good product. Does random shit instead of attending classes.</p>
          </div>
        </div>
      </AnimationContainer>
    </div>
  );
};

export default Me;
