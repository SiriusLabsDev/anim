import React from 'react'
import { SidebarTrigger, useSidebar } from './sidebar';
import { AnimatePresence, motion } from 'motion/react';

const SidebarTriggerCustom = () => {
  const { isMobile } = useSidebar();
  return (
    <AnimatePresence>
      {(!useSidebar().open || isMobile) && 
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -10, transition: { duration: 0.2 }}}
        transition={{
            ease: "easeInOut",
            duration: 0.5,
        }}
      >
        <SidebarTrigger size={"default"} className="absolute top-2 left-0 z-50"/>
      </motion.div>}
    </AnimatePresence>
  )
}

export default SidebarTriggerCustom;
