"use client";
import { useFinanceStore, CATEGORY_COLORS } from "@/store/useFinanceStore";
import { formatCurrency, getMonthlyTrend, getCategoryBreakdown, getSpendingHeatmap, getTotalIncome, getTotalExpenses } from "@/lib/utils";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";
import { motion } from "framer-motion";
import { t } from "@/lib/translations";

export default function AnalyticsPage() {
  const { transactions, currency, lang } = useFinanceStore();
  const tr = t(lang);
  const trend = getMonthlyTrend(transactions);
  const breakdown = getCategoryBreakdown(transactions);
  const heatmap = getSpendingHeatmap(transactions);
  const totalIncome = getTotalIncome(transactions);
  const totalExpenses = getTotalExpenses(transactions);
  const savingsRate = totalIncome > 0 ? (((totalIncome - totalExpenses) / totalIncome) * 100).toFixed(1) : "0";
  const maxHeat = Math.max(...heatmap.map((h) => h.amount), 1);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold" style={{ color: "var(--foreground)" }}>{tr.analyticsTitle}</h1>
        <p className="text-xs md:text-sm mt-1" style={{ color: "var(--muted)" }}>{tr.analyticsSubtitle}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {[
          { label: tr.totalIncome, value: formatCurrency(totalIncome, currency), color: "#22c55e" },
          { label: tr.totalExpenses, value: formatCurrency(totalExpenses, currency), color: "#ef4444" },
          { label: tr.savingsRate, value: `${savingsRate}%`, color: "#6366f1" },
        ].map((item, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="rounded-2xl p-5 text-center" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <p className="text-xs mb-1" style={{ color: "var(--muted)" }}>{item.label}</p>
            <p className="text-xl md:text-2xl font-bold" style={{ color: item.color }}>{item.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="rounded-2xl p-4 md:p-6 mb-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        <h3 className="font-semibold mb-4 text-sm md:text-base" style={{ color: "var(--foreground)" }}>{tr.monthlyCashFlow}</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={trend}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="month" tick={{ fill: "var(--muted)", fontSize: 11 }} />
            <YAxis tick={{ fill: "var(--muted)", fontSize: 11 }} width={50} />
            <Tooltip formatter={(v) => formatCurrency(Number(v), currency)} />
            <Legend />
            <Line type="monotone" dataKey="income" stroke="#22c55e" strokeWidth={2.5} dot={{ r: 3 }} name={tr.income} />
            <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 3 }} name={tr.expenses} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl p-4 md:p-6" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <h3 className="font-semibold mb-4 text-sm md:text-base" style={{ color: "var(--foreground)" }}>{tr.expenseBreakdown}</h3>
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
        </div>

        <div className="rounded-2xl p-4 md:p-6" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <h3 className="font-semibold mb-4 text-sm md:text-base" style={{ color: "var(--foreground)" }}>{tr.spendingByDay}</h3>
          <div className="flex flex-col gap-3 mt-2">
            {heatmap.map((h) => {
              const pct = (h.amount / maxHeat) * 100;
              return (
                <div key={h.day} className="flex items-center gap-3">
                  <span className="text-xs w-8 font-medium" style={{ color: "var(--muted)" }}>{h.day}</span>
                  <div className="flex-1 h-5 rounded-lg overflow-hidden" style={{ background: "var(--border)" }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.7, ease: "easeOut" }}
                      className="h-full rounded-lg" style={{ background: `rgba(99,102,241,${0.3 + (pct / 100) * 0.7})` }} />
                  </div>
                  <span className="text-xs w-16 text-right" style={{ color: "var(--muted)" }}>{formatCurrency(h.amount, currency)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
