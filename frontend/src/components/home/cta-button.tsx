import React from 'react'
import { HoverBorderGradient } from '../ui/hover-border-gradient';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { FaArrowRightLong } from 'react-icons/fa6';

const CtaButton = () => {
  const { isSignedIn } = useAuth()
  const router = useRouter();
  return (
    <HoverBorderGradient className="hover:cursor-pointer flex items-center gap-2"
        onClick={() => {
            if (isSignedIn) {
                router.push("/chat")
            }
            else {
                router.push("/sign-in")
            }
        }}
    >
        Get Started
        <FaArrowRightLong fill="white"/>
    </HoverBorderGradient>
  )
}

export default CtaButton;
