"use client"

import React from 'react'
import { Button } from '@/components/ui/button';
import { axiosInstance } from '@/lib/api';

const page = () => {
  const onClick = async () => {
    const response = await axiosInstance.get('/chat/message/video/61c6c35a-9514-460a-99b5-f212e33c9bb5');
    console.log(response.data);
  }
  return (
    <div>
        <Button variant={'secondary'} onClick={onClick}>
            click me
        </Button>
    </div>
  )
}

export default page;
