"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useFinanceStore } from "@/store/useFinanceStore";
import { useAuth } from "@/context/AuthContext";
import { useFirestoreSync } from "@/lib/useFirestoreData";
import { LANGUAGES } from "@/lib/i18n";
import Sidebar from "./Sidebar";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const darkMode = useFinanceStore((s) => s.darkMode);
  const lang = useFinanceStore((s) => s.lang);
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useFirestoreSync(user?.uid ?? "");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    const langDef = LANGUAGES.find((l) => l.code === lang);
    document.documentElement.setAttribute("lang", lang);
    document.documentElement.setAttribute("dir", langDef?.dir ?? "ltr");
  }, [lang]);

  useEffect(() => {
    if (!loading) {
      if (!user && pathname !== "/login") router.replace("/login");
      if (user && pathname === "/login") router.replace("/dashboard");
    }
  }, [user, loading, pathname, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}>
        <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user || pathname === "/login") return <>{children}</>;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 md:ml-64 mt-14 md:mt-0 p-4 md:p-8 min-h-screen"
        style={{ background: "var(--background)" }}>
        {children}
      </main>
    </div>
  );
}
