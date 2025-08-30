"use client"

import { 
    Sidebar, 
    SidebarContent, 
    SidebarFooter, 
    SidebarGroup, 
    SidebarGroupContent, 
    SidebarGroupLabel, 
    SidebarMenu, 
    SidebarMenuButton, 
    SidebarMenuItem, 
    SidebarProvider, 
    SidebarTrigger 
} from "@/components/ui/sidebar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronUp, User2 } from "lucide-react";

import { useHistoryStore } from "@/store/useHistoryStore"
import Link from "next/link";
import { FaCirclePlus } from "react-icons/fa6";

import { useUser } from "@clerk/nextjs";

const History = () => {
  const { history } = useHistoryStore();
  const { user } = useUser();
  return (
    <div>
        <SidebarProvider className="">
            <SidebarTrigger/>
            <Sidebar>
            <div className="flex gap-2 p-2 items-center text-foreground z-40">
                <SidebarTrigger size={"sm"}/>
                <h3>A N I M</h3>
            </div>
                <SidebarContent className="my-2">
                    <SidebarGroup>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                <SidebarMenuItem key={"New chat"}>
                                <SidebarMenuButton asChild>
                                    <Link href={`/chat`}>
                                        <FaCirclePlus />
                                        <span>New chat</span>
                                    </Link>
                                </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>

                    {/* Recent chats */}
                    <SidebarGroup className="w-full">
                        <SidebarGroupLabel>Recents</SidebarGroupLabel>
                        <SidebarGroupContent className="w-full">
                            <SidebarMenu className="w-full">
                            {history.map((item, index) => (
                                <SidebarMenuItem key={index} className="w-full">
                                    <SidebarMenuButton asChild>
                                        <Link 
                                            key={item.id} href={`/chat/${item.id}`} 
                                            className="w-full p-2 hover:bg-[#111111]"
                                        >
                                            {item.title.slice(0, 20)}
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>

                {/* User footer */}
                <SidebarFooter>
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
                                <span>Account</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <span>Billing</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <span>Sign out</span>
                            </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
            </Sidebar>
        </SidebarProvider>
    </div>
  )
}

export default History;
