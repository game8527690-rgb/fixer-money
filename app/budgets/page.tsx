"use client";
import { useState } from "react";
import { useFinanceStore, CATEGORIES, CATEGORY_ICONS, CATEGORY_COLORS } from "@/store/useFinanceStore";
import { formatCurrency, getSpentForBudget } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

export default function BudgetsPage() {
  const { budgets, transactions, addBudget, deleteBudget, currency } = useFinanceStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ category: "Food" as typeof CATEGORIES[number], limit: "" });
  const currentMonth = format(new Date(), "yyyy-MM");
  const monthBudgets = budgets.filter((b) => b.month === currentMonth);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.limit) return;
    addBudget({ category: form.category, limit: parseFloat(form.limit), month: currentMonth });
    setForm({ category: "Food", limit: "" });
    setShowForm(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold" style={{ color: "var(--foreground)" }}>Budgets</h1>
          <p className="text-xs md:text-sm mt-1" style={{ color: "var(--muted)" }}>{format(new Date(), "MMMM yyyy")}</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 md:px-5 md:py-2.5 rounded-xl text-sm font-medium flex items-center gap-2"
        >
          <Plus size={15} /> New
        </motion.button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            onSubmit={handleAdd}
            className="rounded-2xl p-4 mb-4 flex flex-col sm:flex-row gap-3 items-end"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            <div className="flex-1 w-full">
              <label className="text-xs font-medium mb-1 block" style={{ color: "var(--muted)" }}>Category</label>
              <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as typeof CATEGORIES[number] }))}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: "var(--background)", border: "1px solid var(--border)", color: "var(--foreground)" }}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>)}
              </select>
            </div>
            <div className="flex-1 w-full">
              <label className="text-xs font-medium mb-1 block" style={{ color: "var(--muted)" }}>Monthly Limit</label>
              <input required type="number" min="1" placeholder="0.00"
                value={form.limit} onChange={(e) => setForm((f) => ({ ...f, limit: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: "var(--background)", border: "1px solid var(--border)", color: "var(--foreground)" }} />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button type="submit" className="flex-1 sm:flex-none px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium">Add</button>
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-sm"
                style={{ background: "var(--background)", color: "var(--muted)", border: "1px solid var(--border)" }}>Cancel</button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* 1 col mobile, 2 col desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {monthBudgets.map((budget, i) => {
          const spent = getSpentForBudget(transactions, budget);
          const pct = Math.min((spent / budget.limit) * 100, 100);
          const over80 = pct >= 80;
          const over100 = pct >= 100;
          const color = over100 ? "#ef4444" : over80 ? "#f59e0b" : CATEGORY_COLORS[budget.category] ?? "#6366f1";

          return (
            <motion.div
              key={budget.id}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="rounded-2xl p-5 group"
              style={{ background: "var(--card)", border: `1px solid ${over100 ? "#ef444440" : "var(--border)"}` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{CATEGORY_ICONS[budget.category]}</span>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>{budget.category}</p>
                    <p className="text-xs" style={{ color: "var(--muted)" }}>
                      {formatCurrency(spent, currency)} / {formatCurrency(budget.limit, currency)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {over80 && <AlertTriangle size={15} style={{ color: over100 ? "#ef4444" : "#f59e0b" }} />}
                  <button onClick={() => deleteBudget(budget.id)} style={{ color: "var(--muted)" }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                <motion.div
                  initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full rounded-full" style={{ background: color }}
                />
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-xs" style={{ color: "var(--muted)" }}>
                  {over100 ? "⚠️ Over budget" : over80 ? "⚠️ Almost full" : `${(100 - pct).toFixed(0)}% remaining`}
                </span>
                <span className="text-xs font-medium" style={{ color }}>{pct.toFixed(0)}%</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {monthBudgets.length === 0 && (
        <div className="text-center py-24" style={{ color: "var(--muted)" }}>
          <p className="text-4xl mb-3">📊</p>
          <p className="text-sm">No budgets set. Add one to get started.</p>
        </div>
      )}
    </div>
  );
}
