import React from 'react'
import { Button } from './ui/button';

const Navbar = () => {
  return (
    <div className='h-16 w-full flex items-center justify-between px-6'>
      <div className='text-white font-semibold text-lg'>
        A N I M
      </div>
      <Button variant='secondary' className='hover:cursor-pointer text-background bg-foreground hover:text-foreground backdrop-blur-md'>
        Sign in
      </Button>
    </div>
  )
}

export default Navbar;
