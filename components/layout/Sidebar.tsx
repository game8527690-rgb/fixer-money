"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ArrowLeftRight, PieChart, Target, Moon, Sun, Wallet, BarChart2, Menu, X } from "lucide-react";
import { useFinanceStore } from "@/store/useFinanceStore";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/budgets", label: "Budgets", icon: PieChart },
  { href: "/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/goals", label: "Goals", icon: Target },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { darkMode, toggleDarkMode } = useFinanceStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const NavContent = () => (
    <>
      <div className="flex items-center gap-3 mb-10">
        <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
          <Wallet size={18} className="text-white" />
        </div>
        <span className="text-lg font-bold" style={{ color: "var(--foreground)" }}>
          Money Master
        </span>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} onClick={() => setMobileOpen(false)}>
              <motion.div
                whileHover={{ x: 4 }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  active ? "bg-indigo-600 text-white" : "hover:bg-indigo-50"
                }`}
                style={!active ? { color: "var(--muted)" } : {}}
              >
                <Icon size={18} />
                {label}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <button
        onClick={toggleDarkMode}
        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors hover:bg-indigo-50"
        style={{ color: "var(--muted)" }}
      >
        {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        {darkMode ? "Light Mode" : "Dark Mode"}
      </button>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex w-64 min-h-screen flex-col p-6 fixed left-0 top-0 z-40"
        style={{ background: "var(--card)", borderRight: "1px solid var(--border)" }}
      >
        <NavContent />
      </aside>

      {/* Mobile top bar */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3"
        style={{ background: "var(--card)", borderBottom: "1px solid var(--border)" }}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center">
            <Wallet size={15} className="text-white" />
          </div>
          <span className="font-bold text-sm" style={{ color: "var(--foreground)" }}>Money Master</span>
        </div>
        <button onClick={() => setMobileOpen(true)} style={{ color: "var(--foreground)" }}>
          <Menu size={22} />
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 z-50"
              style={{ background: "rgba(0,0,0,0.5)" }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="md:hidden fixed left-0 top-0 bottom-0 w-72 z-50 flex flex-col p-6"
              style={{ background: "var(--card)" }}
            >
              <button onClick={() => setMobileOpen(false)} className="self-end mb-4" style={{ color: "var(--muted)" }}>
                <X size={22} />
              </button>
              <NavContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
