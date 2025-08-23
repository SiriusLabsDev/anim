"use client"

import React from 'react'
import { Button } from '@/components/ui/button';
import { axiosInstance } from '@/lib/api';

const page = () => {
  const onClick = async () => {
    const response = await axiosInstance.get('/chat/running');
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
