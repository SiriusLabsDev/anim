"use client";

import React, { useEffect } from "react";
import History from "./(components)/History";
import { getHistory } from "@/lib/api";
import { useHistoryStore } from "@/store/useHistoryStore";

export default function Layout({children}: {children: React.ReactNode}) {
  useEffect(() => {
    const fetchHistory = async () => {
      const history = await getHistory();
      useHistoryStore.getState().setHistory(history);
    };
    fetchHistory();
  }, [])
  return (
    <div className="relative flex justify-center items-center h-screen w-full bg-[#0F0F10]">
      <History />
        {children}
    </div>
  );
}
