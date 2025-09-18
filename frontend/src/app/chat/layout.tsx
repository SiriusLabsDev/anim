"use client";

import React, { useEffect, useState } from "react";
import History from "./(components)/History";
import { useHistoryStore } from "@/store/useHistoryStore";
import { useParams, useRouter } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import SidebarTriggerCustom from "@/components/ui/sidebar-trigger";
import { useAuth, useUser } from "@clerk/nextjs";
import { Key, Loader2 } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import useApi from "@/hooks/useApi";

const KeyValueDisplay = ({field, value}: {field: string; value: string | number;}) => {
  return(
    <div className="w-full">
      
      <div className="text-sm text-white/60">
        {field}
      </div>
      <div className="text-white">{value}</div>
    </div>
  )
}

export default function Layout({children}: {children: React.ReactNode}) {
  const [fetchingHistory, setFetchingHistory] = useState(false);
  const { user, isSignedIn } = useUser();

  const { isLoaded } = useAuth();
  const { getHistory, getCreditsData } = useApi();
  
  const router = useRouter();

  const [fetchingCredits, setFetchingCredits] = useState(false);

  const [creditsData, setCreditsData] = useState<{credits: number; refreshed_at: Date | undefined} | null>(null);

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

  useEffect(() => {
    if(!isSignedIn) return;
    const fetchCredits = async () => {
      try {
        setFetchingCredits(true);
        const creditsData  = await getCreditsData();
        console.log(creditsData);
        setCreditsData(creditsData);
      } catch (error) {
        console.error("Error fetching credits data:", error);
      }
      finally { 
        setFetchingCredits(false);
      }
    };
    fetchCredits();
  }, [isSignedIn])


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
      <Dialog>
        <History fetchingHistory={fetchingHistory} />
        <div className={`relative w-full ${id && "bg-[#0F0F10]"}`}>
          <SidebarTriggerCustom />
          {children}
        </div>
          <DialogContent className="sm:max-w-[425px] bg-black/30 backdrop-blur-xl border">
            <DialogHeader>
              <DialogTitle className="text-xl text-left">Account</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4">
              <KeyValueDisplay field="Name" value={user?.fullName || "N/A"} />
              <KeyValueDisplay field="Email" value={user?.primaryEmailAddress?.emailAddress || "N/A"} />
              <KeyValueDisplay field="Credits Remaining" value={creditsData?.credits || "N/A"} />
              {creditsData?.refreshed_at && <KeyValueDisplay field="Credits Last Refreshed" value={creditsData.refreshed_at.toLocaleString() || "N/A"} />}
            </div>
          </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
