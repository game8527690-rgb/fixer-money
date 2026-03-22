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

export default function DashboardPage() {
  const { transactions, currency } = useFinanceStore();
  const [showModal, setShowModal] = useState(false);
  const monthly = getMonthTransactions(transactions);
  const income = getTotalIncome(monthly);
  const expenses = getTotalExpenses(monthly);
  const net = getNetBalance(monthly);
  const breakdown = getCategoryBreakdown(monthly);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>Dashboard</h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>Your financial overview this month</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          + Add Transaction
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Balance" value={formatCurrency(net, currency)} icon={Wallet} color="#6366f1" sub="Net this month" />
        <StatCard title="Income" value={formatCurrency(income, currency)} icon={TrendingUp} color="#22c55e" sub="This month" />
        <StatCard title="Expenses" value={formatCurrency(expenses, currency)} icon={TrendingDown} color="#ef4444" sub="This month" />
        <StatCard title="Transactions" value={String(monthly.length)} icon={ArrowUpDown} color="#f59e0b" sub="This month" />
      </div>

      {/* Charts + Recent */}
      <div className="grid grid-cols-2 gap-6">
        {/* Donut chart */}
        <div className="rounded-2xl p-6" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <h3 className="font-semibold mb-4" style={{ color: "var(--foreground)" }}>Spending by Category</h3>
          {breakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={breakdown} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                  {breakdown.map((entry) => (
                    <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name as keyof typeof CATEGORY_COLORS] ?? "#94a3b8"} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatCurrency(Number(v), currency)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center py-16 text-sm" style={{ color: "var(--muted)" }}>No expenses this month</p>
          )}
        </div>

        <RecentTransactions transactions={transactions} currency={currency} />
      </div>

      {showModal && <AddTransactionModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
