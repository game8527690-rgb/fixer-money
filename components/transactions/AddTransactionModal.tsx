"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useFinanceStore, CATEGORIES, CATEGORY_ICONS, TransactionType } from "@/store/useFinanceStore";

interface Props { onClose: () => void; }

export default function AddTransactionModal({ onClose }: Props) {
  const { addTransaction, currency } = useFinanceStore();
  const [form, setForm] = useState({
    title: "", amount: "", type: "expense" as TransactionType,
    category: "Food" as typeof CATEGORIES[number],
    date: new Date().toISOString().slice(0, 10),
    note: "", recurring: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.amount) return;
    addTransaction({
      ...form,
      amount: parseFloat(form.amount),
      date: new Date(form.date).toISOString(),
      currency,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ background: "rgba(0,0,0,0.5)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
          className="rounded-2xl p-8 w-full max-w-md shadow-2xl"
          style={{ background: "var(--card)" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>Add Transaction</h2>
            <button onClick={onClose} style={{ color: "var(--muted)" }}><X size={20} /></button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Type toggle */}
            <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: "var(--border)" }}>
              {(["expense", "income", "transfer"] as TransactionType[]).map((t) => (
                <button key={t} type="button"
                  onClick={() => setForm((f) => ({ ...f, type: t }))}
                  className={`flex-1 py-2 text-sm font-medium capitalize transition-colors ${form.type === t ? "bg-indigo-600 text-white" : ""}`}
                  style={form.type !== t ? { color: "var(--muted)" } : {}}
                >
                  {t}
                </button>
              ))}
            </div>

            <input
              required placeholder="Title"
              value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none"
              style={{ background: "var(--background)", border: "1px solid var(--border)", color: "var(--foreground)" }}
            />

            <input
              required type="number" min="0" step="0.01" placeholder="Amount"
              value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none"
              style={{ background: "var(--background)", border: "1px solid var(--border)", color: "var(--foreground)" }}
            />

            <select
              value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as typeof CATEGORIES[number] }))}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none"
              style={{ background: "var(--background)", border: "1px solid var(--border)", color: "var(--foreground)" }}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>
              ))}
            </select>

            <input
              type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none"
              style={{ background: "var(--background)", border: "1px solid var(--border)", color: "var(--foreground)" }}
            />

            <input
              placeholder="Note (optional)"
              value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none"
              style={{ background: "var(--background)", border: "1px solid var(--border)", color: "var(--foreground)" }}
            />

            <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: "var(--muted)" }}>
              <input type="checkbox" checked={form.recurring} onChange={(e) => setForm((f) => ({ ...f, recurring: e.target.checked }))} />
              Recurring transaction
            </label>

            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium text-sm hover:bg-indigo-700 transition-colors"
            >
              Add Transaction
            </motion.button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
