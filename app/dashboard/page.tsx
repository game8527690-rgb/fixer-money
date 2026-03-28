"use client";
import { useFinanceStore } from "@/store/useFinanceStore";
import { formatCurrency, getMonthTransactions, getTotalIncome, getTotalExpenses, getNetBalance, getCategoryBreakdown } from "@/lib/utils";
import StatCard from "@/components/dashboard/StatCard";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import { TrendingUp, TrendingDown, Wallet, ArrowUpDown } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { CATEGORY_COLORS } from "@/store/useFinanceStore";
import AddTransactionModal from "@/components/transactions/AddTransactionModal";
import { useState } from "react";
import { motion } from "framer-motion";
import { t } from "@/lib/translations";

export default function DashboardPage() {
  const { transactions, currency, lang } = useFinanceStore();
  const tr = t(lang);
  const [showModal, setShowModal] = useState(false);
  const monthly = getMonthTransactions(transactions);
  const income = getTotalIncome(monthly);
  const expenses = getTotalExpenses(monthly);
  const net = getNetBalance(monthly);
  const breakdown = getCategoryBreakdown(monthly);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold" style={{ color: "var(--foreground)" }}>{tr.dashboardTitle}</h1>
          <p className="text-xs md:text-sm mt-1" style={{ color: "var(--muted)" }}>{tr.dashboardSub}</p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 md:px-5 md:py-2.5 rounded-xl text-sm font-medium">
          + {tr.add}
        </motion.button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <StatCard title={tr.totalBalance} value={formatCurrency(net, currency)} icon={Wallet} color="#6366f1" sub={tr.netThisMonth} />
        <StatCard title={tr.income} value={formatCurrency(income, currency)} icon={TrendingUp} color="#22c55e" sub={tr.thisMonth} />
        <StatCard title={tr.expenses} value={formatCurrency(expenses, currency)} icon={TrendingDown} color="#ef4444" sub={tr.thisMonth} />
        <StatCard title={tr.transactions} value={String(monthly.length)} icon={ArrowUpDown} color="#f59e0b" sub={tr.thisMonth} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="rounded-2xl p-4 md:p-6" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <h3 className="font-semibold mb-4 text-sm md:text-base" style={{ color: "var(--foreground)" }}>{tr.spendingByCategory}</h3>
          {breakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={breakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3} dataKey="value">
                  {breakdown.map((entry) => (
                    <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name as keyof typeof CATEGORY_COLORS] ?? "#94a3b8"} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatCurrency(Number(v), currency)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center py-16 text-sm" style={{ color: "var(--muted)" }}>{tr.noExpenses}</p>
          )}
        </div>
        <RecentTransactions transactions={transactions} currency={currency} lang={lang} />
      </div>

      {showModal && <AddTransactionModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
