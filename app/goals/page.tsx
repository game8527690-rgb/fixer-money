"use client";
import { useState } from "react";
import { useFinanceStore } from "@/store/useFinanceStore";
import { formatCurrency } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2 } from "lucide-react";
import { format, parseISO, differenceInDays } from "date-fns";

export default function GoalsPage() {
  const { goals, addGoal, updateGoalSaved, deleteGoal, currency } = useFinanceStore();
  const [showForm, setShowForm] = useState(false);
  const [depositId, setDepositId] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState("");
  const [form, setForm] = useState({ title: "", target: "", saved: "0", deadline: "", emoji: "🎯" });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.target) return;
    addGoal({ title: form.title, target: parseFloat(form.target), saved: parseFloat(form.saved) || 0, deadline: form.deadline || undefined, emoji: form.emoji });
    setForm({ title: "", target: "", saved: "0", deadline: "", emoji: "🎯" });
    setShowForm(false);
  };

  const handleDeposit = (id: string) => {
    const amt = parseFloat(depositAmount);
    if (!isNaN(amt) && amt > 0) { updateGoalSaved(id, amt); }
    setDepositId(null);
    setDepositAmount("");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>Savings Goals</h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>{goals.length} active goals</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2"
        >
          <Plus size={16} /> New Goal
        </motion.button>
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            onSubmit={handleAdd}
            className="rounded-2xl p-6 mb-6 grid grid-cols-3 gap-4"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            {[
              { label: "Emoji", key: "emoji", type: "text", placeholder: "🎯" },
              { label: "Goal Title", key: "title", type: "text", placeholder: "e.g. Flight to Japan" },
              { label: "Target Amount", key: "target", type: "number", placeholder: "0.00" },
              { label: "Already Saved", key: "saved", type: "number", placeholder: "0.00" },
              { label: "Deadline (optional)", key: "deadline", type: "date", placeholder: "" },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key}>
                <label className="text-xs font-medium mb-1 block" style={{ color: "var(--muted)" }}>{label}</label>
                <input required={key === "title" || key === "target"} type={type} placeholder={placeholder}
                  value={form[key as keyof typeof form]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: "var(--background)", border: "1px solid var(--border)", color: "var(--foreground)" }} />
              </div>
            ))}
            <div className="flex items-end gap-2">
              <button type="submit" className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium">Create</button>
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                style={{ background: "var(--background)", color: "var(--muted)", border: "1px solid var(--border)" }}>Cancel</button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Goal cards */}
      <div className="grid grid-cols-3 gap-4">
        {goals.map((goal, i) => {
          const pct = Math.min((goal.saved / goal.target) * 100, 100);
          const remaining = goal.target - goal.saved;
          const daysLeft = goal.deadline ? differenceInDays(parseISO(goal.deadline), new Date()) : null;
          const done = pct >= 100;

          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="rounded-2xl p-6 group relative"
              style={{ background: "var(--card)", border: `1px solid ${done ? "#22c55e40" : "var(--border)"}` }}
            >
              <button onClick={() => deleteGoal(goal.id)}
                className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: "var(--muted)" }}>
                <Trash2 size={14} />
              </button>

              <div className="text-3xl mb-3">{goal.emoji}</div>
              <h3 className="font-semibold mb-1" style={{ color: "var(--foreground)" }}>{goal.title}</h3>
              <p className="text-xs mb-4" style={{ color: "var(--muted)" }}>
                {formatCurrency(goal.saved, currency)} of {formatCurrency(goal.target, currency)}
              </p>

              {/* Progress */}
              <div className="h-2.5 rounded-full overflow-hidden mb-2" style={{ background: "var(--border)" }}>
                <motion.div
                  initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.9, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ background: done ? "#22c55e" : "#6366f1" }}
                />
              </div>

              <div className="flex justify-between text-xs mb-4" style={{ color: "var(--muted)" }}>
                <span>{done ? "🎉 Goal reached!" : `${formatCurrency(remaining, currency)} to go`}</span>
                <span className="font-medium" style={{ color: done ? "#22c55e" : "#6366f1" }}>{pct.toFixed(0)}%</span>
              </div>

              {daysLeft !== null && (
                <p className="text-xs mb-4" style={{ color: daysLeft < 30 ? "#ef4444" : "var(--muted)" }}>
                  {daysLeft > 0 ? `⏳ ${daysLeft} days left` : "⚠️ Deadline passed"}
                  {goal.deadline && ` · ${format(parseISO(goal.deadline), "MMM d, yyyy")}`}
                </p>
              )}

              {/* Deposit */}
              {!done && (
                depositId === goal.id ? (
                  <div className="flex gap-2">
                    <input type="number" min="0" placeholder="Amount" value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg text-xs outline-none"
                      style={{ background: "var(--background)", border: "1px solid var(--border)", color: "var(--foreground)" }} />
                    <button onClick={() => handleDeposit(goal.id)}
                      className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-xs font-medium">Add</button>
                    <button onClick={() => setDepositId(null)}
                      className="px-3 py-2 rounded-lg text-xs"
                      style={{ background: "var(--background)", color: "var(--muted)", border: "1px solid var(--border)" }}>✕</button>
                  </div>
                ) : (
                  <button onClick={() => setDepositId(goal.id)}
                    className="w-full py-2 rounded-xl text-xs font-medium transition-colors hover:bg-indigo-600 hover:text-white"
                    style={{ border: "1px solid var(--border)", color: "var(--muted)" }}>
                    + Add Funds
                  </button>
                )
              )}
            </motion.div>
          );
        })}
      </div>

      {goals.length === 0 && (
        <div className="text-center py-24" style={{ color: "var(--muted)" }}>
          <p className="text-4xl mb-3">🎯</p>
          <p className="text-sm">No savings goals yet. Create one to start tracking your progress.</p>
        </div>
      )}
    </div>
  );
}
