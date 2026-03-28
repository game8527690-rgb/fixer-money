"use client";
import { useAuth } from "@/context/AuthContext";
import { useFinanceStore } from "@/store/useFinanceStore";
import { motion } from "framer-motion";
import { Wallet } from "lucide-react";
import { t } from "@/lib/translations";

export default function LoginPage() {
  const { signInWithGoogle } = useAuth();
  const lang = useFinanceStore((s) => s.lang);
  const tr = t(lang);

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--background)" }}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm rounded-3xl p-10 text-center"
        style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto mb-6">
          <Wallet size={30} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--foreground)" }}>{tr.loginTitle}</h1>
        <p className="text-sm mb-8" style={{ color: "var(--muted)" }}>{tr.loginSub}</p>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={signInWithGoogle}
          className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl font-medium text-sm transition-colors hover:bg-gray-50"
          style={{ border: "1px solid var(--border)", color: "var(--foreground)", background: "var(--background)" }}>
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.1-4z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.1 18.9 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.4 35.6 26.8 36 24 36c-5.2 0-9.6-2.9-11.3-7.1l-6.5 5C9.6 39.6 16.3 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.9 2.5-2.6 4.6-4.8 6l6.2 5.2C40.5 35.5 44 30.2 44 24c0-1.3-.1-2.7-.4-4z"/>
          </svg>
          {tr.continueWithGoogle}
        </motion.button>
        <p className="text-xs mt-6" style={{ color: "var(--muted)" }}>{tr.loginPrivacy}</p>
      </motion.div>
    </div>
  );
}
