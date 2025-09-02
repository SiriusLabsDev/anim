import React from 'react'
import { SidebarTrigger, useSidebar } from './sidebar';

const SidebarTriggerCustom = () => {
  return (
    <>
      {!useSidebar().open && <SidebarTrigger size={"default"} className="absolute top-2 left-0 z-50"/>}
    </>
  )
}

export default SidebarTriggerCustom;
