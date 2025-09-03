"use client";

import React, { useEffect, useState } from "react";
import History from "./(components)/History";
import { getHistory } from "@/lib/api";
import { useHistoryStore } from "@/store/useHistoryStore";
import { useParams, useRouter } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import SidebarTriggerCustom from "@/components/ui/sidebar-trigger";
import { useAuth, useUser } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

export default function Layout({children}: {children: React.ReactNode}) {
  const [fetchingHistory, setFetchingHistory] = useState(false);
  const { user, isSignedIn } = useUser();

  const { isLoaded } = useAuth();
  
  const router = useRouter();


  useEffect(() => {
    if(!user) return;
    const fetchHistory = async () => {
      try {
        setFetchingHistory(true);
        // await sleep(10 * 2000);
        const history  = await getHistory();
        useHistoryStore.getState().setHistory(history);
      } catch (error) {
        console.error("Error fetching chat history:", error);
      }
      finally { 
        setFetchingHistory(false);
      }
    };
    fetchHistory();
  }, [user]);

  const params = useParams();
  const id = params.id as string | undefined;

  useEffect(() => {
    if(isLoaded && !isSignedIn) {
      router.replace("/sign-in");
    }
  }, [isLoaded, isSignedIn, router])


  return (
    !isLoaded ? (
      <div className="absolute inset-0 flex items-center justify-center bg-black">
        <Loader2 className="animate-spin" />
      </div>
    ) : 
    isSignedIn && <SidebarProvider>
        {!id && <div 
          className="absolute inset-0 opacity-60 z-10 bg-[#080808]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
            backgroundSize: '24px 24px'
          }}
        />}
        <History fetchingHistory={fetchingHistory} />
        <div className={`relative w-full ${id && "bg-[#0F0F10]"}`}>
          <SidebarTriggerCustom />
          {children}
        </div>
    </SidebarProvider>
  );
}
