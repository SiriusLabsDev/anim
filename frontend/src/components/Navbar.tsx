"use client"
import { Button } from './ui/button';
import { UserButton, SignedOut, SignedIn, ClerkLoading } from '@clerk/nextjs';
import Logo from './ui/logo';
import { dark } from '@clerk/themes';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'motion/react';

const Navbar = () => {
  const navItems = [
    {title: "Chat", href: "/chat"},
    {title: "Pricing", href: "/pricing"},
    {title: "About", href: "/about"},
    {title: "Team", href: "/team"},
  ]
  const router = useRouter();
  const [hovered, setHovered] = useState<Number | null>(null);
  return (
    <div className='h-16 w-full flex items-center justify-between px-6'>
      <Link href='/' className='flex gap-4 text-white font-semibold text-lg'>
        <Logo />
        A N I M
      </Link>
        <div 
          className='hidden sm:flex gap-4 items-center'
          onMouseLeave={() => setHovered(null)}
        >
          {
            navItems.map((item, index) => (
              <Link 
                href={item.href}
                className='relative px-4 md:px-8 py-2'
                onMouseEnter={() => setHovered(index)}
                key={index}
              >
                {
                  hovered == index &&
                  <motion.div 
                    className='absolute inset-0 bg-[#efefef20] w-full h-full rounded-full z-10'
                    layoutId='hover'
                  />
                }
                <span className='relative z-20 '>{item.title}</span>
              </Link>
            ))
          }
        </div>
      <ClerkLoading>
        <Loader2 className='animate-spin' />
      </ClerkLoading>
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
