"use client";

import React, { useEffect, useState } from "react";
import History from "./(components)/History";
import { getHistory } from "@/lib/api";
import { useHistoryStore } from "@/store/useHistoryStore";
import { useParams } from "next/navigation";

export default function Layout({children}: {children: React.ReactNode}) {
  const [fetchingHistory, setFetchingHistory] = useState(false);

  useEffect(() => {
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
  }, [])
  const params = useParams();
  const id = params.id as string | undefined;
  return (
    <div className="relative flex justify-center items-center h-screen w-full bg-[#0F0F10]">
      {!id && <div 
        className="absolute inset-0 opacity-60 z-10 bg-[#080808]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }}
      />}
      <History fetchingHistory={fetchingHistory} />
      {children}
    </div>
  );
}
