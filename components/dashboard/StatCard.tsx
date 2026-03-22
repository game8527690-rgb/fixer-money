"use client";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface Props {
  title: string;
  value: string;
  icon: LucideIcon;
  color: string;
  sub?: string;
}

export default function StatCard({ title, value, icon: Icon, color, sub }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="rounded-2xl p-6 flex items-start justify-between"
      style={{ background: "var(--card)", border: "1px solid var(--border)" }}
    >
      <div>
        <p className="text-sm mb-1" style={{ color: "var(--muted)" }}>{title}</p>
        <p className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>{value}</p>
        {sub && <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>{sub}</p>}
      </div>
      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${color}20` }}>
        <Icon size={22} style={{ color }} />
      </div>
    </motion.div>
  );
}
