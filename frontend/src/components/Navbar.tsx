import React from 'react'
import { Button } from './ui/button';
import { SignInButton, UserButton } from '@clerk/nextjs';
import { SignedOut, SignedIn } from '@clerk/nextjs';

const Navbar = () => {
  return (
    <div className='h-16 w-full flex items-center justify-between px-6'>
      <div className='text-white font-semibold text-lg'>
        A N I M
      </div>
      <SignedOut>
        <Button variant='secondary' className='hover:cursor-pointer text-background bg-foreground hover:text-foreground backdrop-blur-md'>
          {/* Sign in */}
          <SignInButton />
        </Button>
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </div>
  )
}

export default Navbar;
