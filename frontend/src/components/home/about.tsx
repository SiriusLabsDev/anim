import React from 'react'
import { Card, CardContent } from '../ui/card';

const About = () => {
  return (
    <div className='w-full'>
        <div className='flex flex-col items-center my-4'>
            <h2 className="!leading-[1.1] mt-6 text-center font-heading font-medium text-3xl text-foreground md:text-4xl lg:text-center">
                About Anim
            </h2>
            <p className="mt-4 max-w-lg text-center text-lg text-muted-foreground lg:text-center">
                My backstory building this product.
            </p>
        </div>
        <Card className='bg-black'>
            <CardContent className='text-neutral-200'>
                Hey guys this is a card
            </CardContent>
        </Card>
    </div>
  )
}

export default About;
