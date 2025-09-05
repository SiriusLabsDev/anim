"use client"

import React from 'react'
import { Card, CardContent } from '../ui/card';
import AnimationContainer from '../ui/animation-container';

const About = () => {
  return (
    <div className='w-full'>
        <AnimationContainer className='flex flex-col items-center my-4 pb-4' delay={0.1}>
            <h2 className="!leading-[1.1] mt-6 text-center font-heading font-medium text-3xl text-foreground md:text-4xl lg:text-center">
                About Anim
            </h2>
            <p className="mt-4 max-w-lg text-center text-lg text-muted-foreground lg:text-center">
                My backstory building this product.
            </p>
        </AnimationContainer>
        <AnimationContainer delay={0.2}>
            <Card className='bg-black relative mt-8 mx-8'>
                <CardContent 
                    className='text-foreground/75 tracking-wide'
                    style={{
                        lineHeight: '1.8rem'
                    }}
                >
                    I've been watching 3blue1brown for a long time and I've loved his animations.
                    I found out that Grant (the creator of 3blue1brown) made these videos using a Python library named
                    Manim (which he himself created, how cool is that). Since I have been using AI to write for a long
                    time now, I decided to use it to generate Manim videos and hence, Anim was born. I have an intuition
                    that as LLMs get better and better, the quality of animations being generated will dramatically improve
                    and we will see longer and longer animations being genrated using AI. That being said, we can create animations
                    that match 3b1b but Grant's teaching style shall stay unmatched!
                </CardContent>
            </Card>
        </AnimationContainer>
    </div>
  )
}

export default About;
