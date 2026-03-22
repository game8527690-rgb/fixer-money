"use client";
import { useEffect } from "react";
import { useFinanceStore } from "@/store/useFinanceStore";
import Sidebar from "./Sidebar";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const darkMode = useFinanceStore((s) => s.darkMode);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      {/* Desktop: offset for sidebar. Mobile: offset for top bar */}
      <main
        className="flex-1 md:ml-64 mt-14 md:mt-0 p-4 md:p-8 min-h-screen"
        style={{ background: "var(--background)" }}
      >
        {children}
      </main>
    </div>
  );
}
