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
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("");
  const [saved, setSaved] = useState("");
  const [deadline, setDeadline] = useState("");
  const [emoji, setEmoji] = useState("🎯");

  const resetForm = () => {
    setTitle(""); setTarget(""); setSaved(""); setDeadline(""); setEmoji("🎯"); setError("");
  };

  const handleAdd = () => {
    if (!title.trim()) { setError("Title is required"); return; }
    if (!target || isNaN(parseFloat(target)) || parseFloat(target) <= 0) { setError("Valid target amount is required"); return; }
    addGoal({
      title: title.trim(),
      target: parseFloat(target),
      saved: parseFloat(saved) || 0,
      deadline: deadline ? new Date(deadline).toISOString() : undefined,
      emoji: emoji || "🎯",
    });
    resetForm();
    setShowForm(false);
  };

  const handleDeposit = (id: string) => {
    const amt = parseFloat(depositAmount);
    if (!isNaN(amt) && amt > 0) updateGoalSaved(id, amt);
    setDepositId(null);
    setDepositAmount("");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold" style={{ color: "var(--foreground)" }}>Savings Goals</h1>
          <p className="text-xs md:text-sm mt-1" style={{ color: "var(--muted)" }}>{goals.length} active goals</p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={() => { resetForm(); setShowForm(true); }}
          className="bg-indigo-600 text-white px-4 py-2 md:px-5 md:py-2.5 rounded-xl text-sm font-medium flex items-center gap-2">
          <Plus size={15} /> New
        </motion.button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="rounded-2xl p-5 mb-5 overflow-hidden"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: "var(--muted)" }}>Emoji</label>
                <input type="text" placeholder="🎯" value={emoji} onChange={(e) => setEmoji(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: "var(--background)", border: "1px solid var(--border)", color: "var(--foreground)" }} />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: "var(--muted)" }}>Goal Title *</label>
                <input type="text" placeholder="e.g. Flight to Japan" value={title} onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: "var(--background)", border: "1px solid var(--border)", color: "var(--foreground)" }} />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: "var(--muted)" }}>Target Amount *</label>
                <input type="number" placeholder="0.00" value={target} onChange={(e) => setTarget(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: "var(--background)", border: "1px solid var(--border)", color: "var(--foreground)" }} />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: "var(--muted)" }}>Already Saved</label>
                <input type="number" placeholder="0.00" value={saved} onChange={(e) => setSaved(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: "var(--background)", border: "1px solid var(--border)", color: "var(--foreground)" }} />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: "var(--muted)" }}>Deadline (optional)</label>
                <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: "var(--background)", border: "1px solid var(--border)", color: "var(--foreground)" }} />
              </div>
            </div>
            {error && <p className="text-xs mt-3" style={{ color: "#ef4444" }}>{error}</p>}
            <div className="flex gap-2 mt-4">
              <button type="button" onClick={handleAdd}
                className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium">Create Goal</button>
              <button type="button" onClick={() => { setShowForm(false); resetForm(); }}
                className="flex-1 py-2.5 rounded-xl text-sm"
                style={{ background: "var(--background)", color: "var(--muted)", border: "1px solid var(--border)" }}>Cancel</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {goals.map((goal, i) => {
          const pct = Math.min((goal.saved / goal.target) * 100, 100);
          const remaining = goal.target - goal.saved;
          const daysLeft = goal.deadline ? differenceInDays(parseISO(goal.deadline), new Date()) : null;
          const done = pct >= 100;
          return (
            <motion.div key={goal.id}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="rounded-2xl p-5 relative"
              style={{ background: "var(--card)", border: `1px solid ${done ? "#22c55e40" : "var(--border)"}` }}>
              <button onClick={() => deleteGoal(goal.id)} className="absolute top-4 right-4" style={{ color: "var(--muted)" }}>
                <Trash2 size={14} />
              </button>
              <div className="text-3xl mb-3">{goal.emoji}</div>
              <h3 className="font-semibold mb-1 pr-6" style={{ color: "var(--foreground)" }}>{goal.title}</h3>
              <p className="text-xs mb-4" style={{ color: "var(--muted)" }}>
                {formatCurrency(goal.saved, currency)} of {formatCurrency(goal.target, currency)}
              </p>
              <div className="h-2.5 rounded-full overflow-hidden mb-2" style={{ background: "var(--border)" }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.9, ease: "easeOut" }} className="h-full rounded-full"
                  style={{ background: done ? "#22c55e" : "#6366f1" }} />
              </div>
              <div className="flex justify-between text-xs mb-3" style={{ color: "var(--muted)" }}>
                <span>{done ? "🎉 Goal reached!" : `${formatCurrency(remaining, currency)} to go`}</span>
                <span className="font-medium" style={{ color: done ? "#22c55e" : "#6366f1" }}>{pct.toFixed(0)}%</span>
              </div>
              {daysLeft !== null && (
                <p className="text-xs mb-3" style={{ color: daysLeft < 30 ? "#ef4444" : "var(--muted)" }}>
                  {daysLeft > 0 ? `⏳ ${daysLeft} days left` : "⚠️ Deadline passed"}
                  {goal.deadline && ` · ${format(parseISO(goal.deadline), "MMM d, yyyy")}`}
                </p>
              )}
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

      {goals.length === 0 && !showForm && (
        <div className="text-center py-24" style={{ color: "var(--muted)" }}>
          <p className="text-4xl mb-3">🎯</p>
          <p className="text-sm">No savings goals yet.</p>
        </div>
      )}
    </div>
  );
}
