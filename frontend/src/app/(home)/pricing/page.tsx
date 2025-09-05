import React from 'react'
import Pricing from '@/components/home/pricing';

export default function Page() {
  return (
    <div id="pricing" className="w-full flex flex-col items-center my-8">
        <div className="space-y-8 w-[min(80%,50rem)] items-center">
          <Pricing /> 
        </div>
    </div>
  )
}
