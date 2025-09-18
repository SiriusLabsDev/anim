"use client"

import React from 'react'
import { Button } from '@/components/ui/button';
import { axiosInstance } from '@/lib/api';

const page = () => {
  const onClick = async () => {
    const ws = new WebSocket("ws://localhost:8000/api/chat/ws?chat_id=test-chat-id&token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiYWN0aXZlX3VzZXJfMSIsImlzcyI6ImNsZXJrIiwiaWF0IjoxNjg4NzI0MDAwfQ.d8e6bX4HjvUeX6nVYkY4m3p8rV1b7jXW2v8yZ3xX6H8");
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
