"use client";
import { motion } from "framer-motion";
import { Transaction, CATEGORY_ICONS } from "@/store/useFinanceStore";
import { formatCurrency } from "@/lib/utils";
import { format, parseISO } from "date-fns";

interface Props {
  transactions: Transaction[];
  currency: string;
}

export default function RecentTransactions({ transactions, currency }: Props) {
  const recent = transactions.slice(0, 6);
  return (
    <div className="rounded-2xl p-6" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
      <h3 className="font-semibold mb-4" style={{ color: "var(--foreground)" }}>Recent Transactions</h3>
      <div className="flex flex-col gap-3">
        {recent.map((t, i) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center justify-between py-2"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{CATEGORY_ICONS[t.category]}</span>
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{t.title}</p>
                <p className="text-xs" style={{ color: "var(--muted)" }}>
                  {format(parseISO(t.date), "MMM d")} · {t.category}
                  {t.recurring && " · 🔄"}
                </p>
              </div>
            </div>
            <span
              className="text-sm font-semibold"
              style={{ color: t.type === "income" ? "var(--income)" : "var(--expense)" }}
            >
              {t.type === "income" ? "+" : "-"}{formatCurrency(t.amount, currency)}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
