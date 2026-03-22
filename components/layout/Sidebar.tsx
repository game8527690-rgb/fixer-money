"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ArrowLeftRight, PieChart, Target, Moon, Sun, Wallet } from "lucide-react";
import { useFinanceStore } from "@/store/useFinanceStore";
import { motion } from "framer-motion";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/budgets", label: "Budgets", icon: PieChart },
  { href: "/analytics", label: "Analytics", icon: PieChart },
  { href: "/goals", label: "Goals", icon: Target },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { darkMode, toggleDarkMode } = useFinanceStore();

  return (
    <aside
      style={{ background: "var(--card)", borderRight: "1px solid var(--border)" }}
      className="w-64 min-h-screen flex flex-col p-6 fixed left-0 top-0 z-40"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 mb-10">
        <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
          <Wallet size={18} className="text-white" />
        </div>
        <span className="text-lg font-bold" style={{ color: "var(--foreground)" }}>
          Money Master
        </span>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 flex-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href}>
              <motion.div
                whileHover={{ x: 4 }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? "bg-indigo-600 text-white"
                    : "hover:bg-indigo-50 dark:hover:bg-slate-700"
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

      {/* Dark mode toggle */}
      <button
        onClick={toggleDarkMode}
        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors hover:bg-indigo-50"
        style={{ color: "var(--muted)" }}
      >
        {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        {darkMode ? "Light Mode" : "Dark Mode"}
      </button>
    </aside>
  );
}
