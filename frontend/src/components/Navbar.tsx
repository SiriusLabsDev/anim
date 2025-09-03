"use client"
import { Button } from './ui/button';
import { UserButton, SignedOut, SignedIn } from '@clerk/nextjs';
import Logo from './ui/logo';
import { dark } from '@clerk/themes';
import { useRouter } from 'next/navigation';

const Navbar = () => {
  const router = useRouter();
  return (
    <div className='h-16 w-full flex items-center justify-between px-6'>
      <div className='flex gap-4 text-white font-semibold text-lg'>
        <Logo />
        A N I M
      </div>
      <SignedOut>
        <Button 
          variant='secondary' 
          className='hover:cursor-pointer text-background bg-foreground rounded-full hover:text-primary-foreground hover:bg-primary'
          onClick={() => {
            router.push('/sign-in');
          }}
        >
          {/* Sign in */}
          Sign In
        </Button>
      </SignedOut>
      <SignedIn>
        <UserButton 
        appearance={{ 
          baseTheme: dark
        }}
        
        />
      </SignedIn>
      {/* <SignOutButton /> */}
    </div>
  )
}

export default Navbar;
