"use client"

import React from 'react'
import AnimationContainer from '../ui/animation-container';
import MagicCard from '../ui/magic-card';
import { MessageSquareText, TvMinimalPlay, Repeat2 } from 'lucide-react';



const HowTo = () => {
    const PROCESS = [
        {
            icon: MessageSquareText, 
            "title": "Prompt", 
            "description": "Describe the type, topic and description of video you'd want to generate"
        },
        {
            icon: TvMinimalPlay, 
            "title": "Generate", 
            "description": "Our AI processes your prompt and generates your video in a couple of minutes."
        },
        {
            icon: Repeat2, 
            "title": "Iterate", 
            "description": "Re-prompt and describe edits you want in your video until desired."
        },
    ]
  return (
    <div>
      <AnimationContainer delay={0.1}>
        <div className="mx-auto flex w-full max-w-xl flex-col items-center justify-center py-8 lg:items-center">
            {/* <MagicBadge title="The Process" /> */}
            <h2 className="!leading-[1.1] mt-6 text-center font-heading font-medium text-3xl text-foreground md:text-5xl lg:text-center">
                Generate video effortlessly in a few simple steps
            </h2>
            <p className="mt-4 max-w-lg text-center text-lg text-muted-foreground lg:text-center">
                Describe your imagination and we handle the rest
            </p>
        </div>
        </AnimationContainer>
        <div className="grid w-full grid-cols-1 gap-4 py-8 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
        {PROCESS.map((process, id) => (
            <AnimationContainer delay={0.2 * id} key={id}>
                <MagicCard className="group md:py-8">
                    <div className="flex w-full flex-col items-start justify-center">
                        <process.icon
                            strokeWidth={1.5}
                            className="h-10 w-10 text-foreground"
                        />
                        <div className="relative flex flex-col items-start">
                            <span className="-top-6 absolute right-0 flex h-12 w-12 items-center justify-center rounded-full border-2 border-border pt-0.5 font-medium text-2xl text-foreground">
                                {id + 1}
                            </span>
                            <h3 className="mt-6 font-medium text-base text-foreground">
                                {process.title}
                            </h3>
                            <p className="mt-2 text-muted-foreground text-sm">
                                {process.description}
                            </p>
                        </div>
                    </div>
                </MagicCard>
            </AnimationContainer>
        ))}
        </div>
    </div>
  )
}

export default HowTo;
