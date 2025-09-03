import React from 'react'
import Image from 'next/image';

const Logo = () => {
  return (
    <Image
      src="/anim-logo.svg"
      alt="Logo"
      width={30}
      height={30}
    />
  )
}

export default Logo;
