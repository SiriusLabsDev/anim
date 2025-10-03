"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ChevronUp, User2 } from "lucide-react";

import { useHistoryStore } from "@/store/useHistoryStore";
import Link from "next/link";
import { FaCirclePlus } from "react-icons/fa6";

import { useAuth, useUser } from "@clerk/nextjs";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { AnimatePresence, motion } from "motion/react";
import { useParams } from "next/navigation";
import { compressTitle } from "@/lib/utils";
import { useRef } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  fetchingHistory: boolean;
}

const History: React.FC<Props> = ({ fetchingHistory }) => {
  const { history } = useHistoryStore();
  const { user } = useUser();
  const params = useParams();

  const id = params.id as string | undefined;

  const { signOut } = useAuth();
  const { isMobile } = useSidebar();

  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <Sidebar>
      <SidebarHeader className="bg-[#0A0A0A] ">
        <SidebarMenu>
          <SidebarMenuItem key={"Logo"}>
            <div className="flex gap-2 py-4 items-center text-foreground z-40">
              <SidebarTrigger size={"sm"} ref={triggerRef} />
              <h3 className="font-bold">A N I M</h3>
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem key={"New chat"}>
            <SidebarMenuButton asChild>
              <Link
                href={`/chat`}
                className="font-bold w-auto h-fit text-[0.9rem]"
              >
                <FaCirclePlus className="scale-125 mr-1" />
                <div className="">New chat</div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="bg-[#0A0A0A] scrollbar">
        {/* Recent chats */}
        <SidebarGroup className="w-full">
          <SidebarGroupLabel>Recents</SidebarGroupLabel>
          <SidebarGroupContent className="w-full">
            <SidebarMenu className="w-full h-full ">
              {fetchingHistory && (
                <div className="flex justify-center items-center h-full">
                  <Spinner size={20} className="mt-8" />
                </div>
              )}
              <AnimatePresence mode="popLayout">
                <div className="">
                  {!fetchingHistory && ( history.length !== 0 ?
                    (history.map((item) => (
                      <motion.div
                        key={item.id}
                        layout // This enables layout animations for position changes
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{
                          layout: { duration: 0.3, ease: "easeOut" }, // Layout transition
                          opacity: { duration: 0.2 },
                          y: { duration: 0.3, ease: "easeOut" },
                        }}
                      >
                        <SidebarMenuItem className="w-full">
                          <SidebarMenuButton asChild>
                            <Link
                              href={`/chat/${item.id}`}
                              className={`w-full p-2 text-sm hover:bg-[#111111] rounded-md ${
                                id === item.id
                                  ? "bg-[#222222] font-semibold"
                                  : ""
                              }`}
                              onClick={() => {
                                if (isMobile) {
                                  triggerRef.current?.click();
                                }
                              }}
                            >
                              <div>{compressTitle(item.title, 28)}</div>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      </motion.div>
                    ))) : (
                      <div className="text-sm text-gray-500 p-4 italic">
                        No recent chats.
                      </div>
                    )
                    )}
                </div>
              </AnimatePresence>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* User footer */}
      <SidebarFooter className="bg-[#0A0A0A] border-t border-t-[#222222]">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <User2 /> {user?.firstName}
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width]"
              >
                <DropdownMenuItem>
                <DialogTrigger asChild>
                  <button className="w-full text-left m-0">Account</button>
                </DialogTrigger>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>Billing</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span onClick={() => signOut()}>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default History;
