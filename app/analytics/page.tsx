"use client";
import { useFinanceStore, CATEGORY_COLORS } from "@/store/useFinanceStore";
import { formatCurrency, getMonthlyTrend, getCategoryBreakdown, getSpendingHeatmap, getTotalIncome, getTotalExpenses } from "@/lib/utils";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, BarChart, Bar,
} from "recharts";
import { motion } from "framer-motion";

export default function AnalyticsPage() {
  const { transactions, currency } = useFinanceStore();
  const trend = getMonthlyTrend(transactions);
  const breakdown = getCategoryBreakdown(transactions);
  const heatmap = getSpendingHeatmap(transactions);
  const totalIncome = getTotalIncome(transactions);
  const totalExpenses = getTotalExpenses(transactions);
  const savingsRate = totalIncome > 0 ? (((totalIncome - totalExpenses) / totalIncome) * 100).toFixed(1) : "0";

  const maxHeat = Math.max(...heatmap.map((h) => h.amount), 1);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>Analytics</h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>Deep dive into your financial patterns</p>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Income", value: formatCurrency(totalIncome, currency), color: "#22c55e" },
          { label: "Total Expenses", value: formatCurrency(totalExpenses, currency), color: "#ef4444" },
          { label: "Savings Rate", value: `${savingsRate}%`, color: "#6366f1" },
        ].map((item, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="rounded-2xl p-6 text-center"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <p className="text-sm mb-1" style={{ color: "var(--muted)" }}>{item.label}</p>
            <p className="text-2xl font-bold" style={{ color: item.color }}>{item.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Monthly trend line chart */}
      <div className="rounded-2xl p-6 mb-6" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        <h3 className="font-semibold mb-4" style={{ color: "var(--foreground)" }}>Monthly Cash Flow</h3>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={trend}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="month" tick={{ fill: "var(--muted)", fontSize: 12 }} />
            <YAxis tick={{ fill: "var(--muted)", fontSize: 12 }} />
            <Tooltip formatter={(v) => formatCurrency(Number(v), currency)} />
            <Legend />
            <Line type="monotone" dataKey="income" stroke="#22c55e" strokeWidth={2.5} dot={{ r: 4 }} name="Income" />
            <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 4 }} name="Expenses" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Category donut */}
        <div className="rounded-2xl p-6" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <h3 className="font-semibold mb-4" style={{ color: "var(--foreground)" }}>Expense Breakdown</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={breakdown} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                {breakdown.map((entry) => (
                  <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name as keyof typeof CATEGORY_COLORS] ?? "#94a3b8"} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => formatCurrency(Number(v), currency)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Spending heatmap by day */}
        <div className="rounded-2xl p-6" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <h3 className="font-semibold mb-4" style={{ color: "var(--foreground)" }}>Spending by Day of Week</h3>
          <div className="flex flex-col gap-3 mt-2">
            {heatmap.map((h) => {
              const pct = (h.amount / maxHeat) * 100;
              return (
                <div key={h.day} className="flex items-center gap-3">
                  <span className="text-xs w-8 font-medium" style={{ color: "var(--muted)" }}>{h.day}</span>
                  <div className="flex-1 h-6 rounded-lg overflow-hidden" style={{ background: "var(--border)" }}>
                    <motion.div
                      initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.7, ease: "easeOut" }}
                      className="h-full rounded-lg"
                      style={{ background: `rgba(99,102,241,${0.3 + (pct / 100) * 0.7})` }}
                    />
                  </div>
                  <span className="text-xs w-20 text-right" style={{ color: "var(--muted)" }}>
                    {formatCurrency(h.amount, currency)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
