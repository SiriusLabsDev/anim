"use client"

import React from 'react'
import { Button } from '@/components/ui/button';
import axios from 'axios';

const page = () => {
  const onClick = () => {
    axios.get('http://localhost:8000/chat/test', {
        withCredentials: true,
    })
      .then(response => {
        console.log(response.data);
      })
      .catch(error => {
        console.error('Error fetching test route:', error);
      });
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
