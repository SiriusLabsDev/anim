"use client";

import React, { useEffect, useState } from "react";
import History from "./(components)/History";
import { getHistory } from "@/lib/api";
import { useHistoryStore } from "@/store/useHistoryStore";

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
  return (
    <div className="relative flex justify-center items-center h-screen w-full bg-[#0F0F10]">
      <History fetchingHistory={fetchingHistory} />
        {children}
    </div>
  );
}
