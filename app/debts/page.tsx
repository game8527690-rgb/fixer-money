"use client";
import { useState } from "react";
import { useFinanceStore, CURRENCIES, CURRENCY_SYMBOLS, DebtDirection } from "@/store/useFinanceStore";
import { formatCurrency } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, CheckCircle, ChevronDown, ChevronUp, Clock, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import { format, parseISO, differenceInDays, isPast } from "date-fns";

type Tab = "all" | "owed_to_me" | "i_owe";
type StatusFilter = "all" | "pending" | "partial" | "settled";

const STATUS_COLORS = {
  pending: { bg: "#fef3c7", text: "#d97706" },
  partial: { bg: "#dbeafe", text: "#2563eb" },
  settled: { bg: "#dcfce7", text: "#16a34a" },
};

export default function DebtsPage() {
  const { debts, addDebt, recordDebtPayment, settleDebt, deleteDebt, currency } = useFinanceStore();
  const [tab, setTab] = useState<Tab>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [paymentDebtId, setPaymentDebtId] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentNote, setPaymentNote] = useState("");

  const [form, setForm] = useState({
    direction: "owed_to_me" as DebtDirection,
    personName: "",
    amount: "",
    currency,
    date: new Date().toISOString().slice(0, 10),
    dueDate: "",
    reason: "",
    note: "",
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.personName.trim()) { setFormError("Person's name is required"); return; }
    if (!form.reason.trim()) { setFormError("Reason is required"); return; }
    if (!form.amount || isNaN(parseFloat(form.amount))) { setFormError("Amount is required"); return; }
    setFormError("");
    addDebt({
      direction: form.direction,
      personName: form.personName.trim(),
      amount: parseFloat(form.amount),
      currency: form.currency,
      date: new Date(form.date).toISOString(),
      dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : undefined,
      reason: form.reason.trim(),
      note: form.note.trim() || undefined,
    });
    setForm({ direction: "owed_to_me", personName: "", amount: "", currency, date: new Date().toISOString().slice(0, 10), dueDate: "", reason: "", note: "" });
    setShowForm(false);
  };

  const handlePayment = (debtId: string) => {
    const amt = parseFloat(paymentAmount);
    if (!isNaN(amt) && amt > 0) {
      recordDebtPayment(debtId, { amount: amt, date: new Date().toISOString(), note: paymentNote || undefined });
    }
    setPaymentDebtId(null);
    setPaymentAmount("");
    setPaymentNote("");
  };

  const filtered = debts.filter((d) => {
    const matchTab = tab === "all" || d.direction === tab;
    const matchStatus = statusFilter === "all" || d.status === statusFilter;
    return matchTab && matchStatus;
  });

  const owedToMe = debts.filter((d) => d.direction === "owed_to_me" && d.status !== "settled");
  const iOwe = debts.filter((d) => d.direction === "i_owe" && d.status !== "settled");
  const totalOwedToMe = owedToMe.reduce((s, d) => s + (d.amount - d.amountPaid), 0);
  const totalIOwe = iOwe.reduce((s, d) => s + (d.amount - d.amountPaid), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold" style={{ color: "var(--foreground)" }}>Debts</h1>
          <p className="text-xs md:text-sm mt-1" style={{ color: "var(--muted)" }}>Track who owes you and who you owe</p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={() => { setShowForm(true); setFormError(""); }}
          className="bg-indigo-600 text-white px-4 py-2 md:px-5 md:py-2.5 rounded-xl text-sm font-medium flex items-center gap-2">
          <Plus size={15} /> New Debt
        </motion.button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#dcfce7" }}>
              <TrendingUp size={16} style={{ color: "#16a34a" }} />
            </div>
            <span className="text-sm font-medium" style={{ color: "var(--muted)" }}>Owed to Me</span>
          </div>
          <p className="text-2xl font-bold" style={{ color: "#16a34a" }}>{formatCurrency(totalOwedToMe, currency)}</p>
          <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>{owedToMe.length} active</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#fee2e2" }}>
              <TrendingDown size={16} style={{ color: "#dc2626" }} />
            </div>
            <span className="text-sm font-medium" style={{ color: "var(--muted)" }}>I Owe</span>
          </div>
          <p className="text-2xl font-bold" style={{ color: "#dc2626" }}>{formatCurrency(totalIOwe, currency)}</p>
          <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>{iOwe.length} active</p>
        </motion.div>
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="rounded-2xl p-5 mb-5 overflow-hidden"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <form onSubmit={handleAdd}>
              <h3 className="font-semibold mb-4 text-sm" style={{ color: "var(--foreground)" }}>New Debt Entry</h3>
              <div className="flex rounded-xl overflow-hidden border mb-4" style={{ borderColor: "var(--border)" }}>
                {([["owed_to_me", "💰 Owed to Me"], ["i_owe", "💸 I Owe"]] as [DebtDirection, string][]).map(([val, label]) => (
                  <button key={val} type="button"
                    onClick={() => setForm((f) => ({ ...f, direction: val }))}
                    className={`flex-1 py-2.5 text-sm font-medium transition-colors ${form.direction === val ? "bg-indigo-600 text-white" : ""}`}
                    style={form.direction !== val ? { color: "var(--muted)" } : {}}>
                    {label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: "Person's Name *", key: "personName", type: "text", placeholder: "John Doe" },
                  { label: "Reason *", key: "reason", type: "text", placeholder: "e.g. Dinner, Loan" },
                  { label: "Amount *", key: "amount", type: "number", placeholder: "0.00" },
                  { label: "Date", key: "date", type: "date", placeholder: "" },
                  { label: "Due Date (optional)", key: "dueDate", type: "date", placeholder: "" },
                  { label: "Note (optional)", key: "note", type: "text", placeholder: "Any extra details" },
                ].map(({ label, key, type, placeholder }) => (
                  <div key={key}>
                    <label className="text-xs font-medium mb-1 block" style={{ color: "var(--muted)" }}>{label}</label>
                    <input type={type} placeholder={placeholder}
                      value={form[key as keyof typeof form]}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                      style={{ background: "var(--background)", border: "1px solid var(--border)", color: "var(--foreground)" }} />
                  </div>
                ))}
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: "var(--muted)" }}>Currency</label>
                  <select value={form.currency} onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: "var(--background)", border: "1px solid var(--border)", color: "var(--foreground)" }}>
                    {CURRENCIES.map((c) => <option key={c} value={c}>{CURRENCY_SYMBOLS[c]} {c}</option>)}
                  </select>
                </div>
              </div>

              {formError && <p className="text-xs mt-2" style={{ color: "#ef4444" }}>{formError}</p>}

              <div className="flex gap-2 mt-4">
                <button type="submit" className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium">Add Debt</button>
                <button type="button" onClick={() => { setShowForm(false); setFormError(""); }} className="flex-1 py-2.5 rounded-xl text-sm"
                  style={{ background: "var(--background)", color: "var(--muted)", border: "1px solid var(--border)" }}>Cancel</button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {(["all", "owed_to_me", "i_owe"] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-colors ${tab === t ? "bg-indigo-600 text-white" : ""}`}
            style={tab !== t ? { background: "var(--card)", color: "var(--muted)", border: "1px solid var(--border)" } : {}}>
            {t === "all" ? "All" : t === "owed_to_me" ? "💰 Owed to Me" : "💸 I Owe"}
          </button>
        ))}
        <div className="ml-auto">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="px-3 py-2 rounded-xl text-xs outline-none"
            style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--foreground)" }}>
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="partial">Partial</option>
            <option value="settled">Settled</option>
          </select>
        </div>
      </div>

      {/* Debt cards */}
      <div className="flex flex-col gap-3">
        <AnimatePresence>
          {filtered.map((debt, i) => {
            const remaining = debt.amount - debt.amountPaid;
            const pct = Math.min((debt.amountPaid / debt.amount) * 100, 100);
            const isExpanded = expandedId === debt.id;
            const isOverdue = debt.dueDate && isPast(parseISO(debt.dueDate)) && debt.status !== "settled";
            const daysLeft = debt.dueDate ? differenceInDays(parseISO(debt.dueDate), new Date()) : null;
            const statusColor = STATUS_COLORS[debt.status];

            return (
              <motion.div key={debt.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                transition={{ delay: i * 0.04 }}
                className="rounded-2xl overflow-hidden"
                style={{ background: "var(--card)", border: `1px solid ${isOverdue ? "#ef444440" : "var(--border)"}` }}>

                <div className="p-4 md:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
                        style={{ background: debt.direction === "owed_to_me" ? "#dcfce7" : "#fee2e2" }}>
                        {debt.direction === "owed_to_me" ? "💰" : "💸"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>{debt.personName}</p>
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{ background: statusColor.bg, color: statusColor.text }}>{debt.status}</span>
                          {isOverdue && (
                            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "#fee2e2", color: "#dc2626" }}>overdue</span>
                          )}
                        </div>
                        <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{debt.reason}</p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                          {format(parseISO(debt.date), "MMM d, yyyy")}
                          {debt.dueDate && ` · Due ${format(parseISO(debt.dueDate), "MMM d, yyyy")}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-base" style={{ color: debt.direction === "owed_to_me" ? "#16a34a" : "#dc2626" }}>
                        {formatCurrency(remaining, debt.currency)}
                      </p>
                      {debt.amountPaid > 0 && (
                        <p className="text-xs" style={{ color: "var(--muted)" }}>of {formatCurrency(debt.amount, debt.currency)}</p>
                      )}
                    </div>
                  </div>

                  {debt.amountPaid > 0 && (
                    <div className="mt-3">
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.7 }}
                          className="h-full rounded-full" style={{ background: debt.status === "settled" ? "#22c55e" : "#6366f1" }} />
                      </div>
                      <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>{formatCurrency(debt.amountPaid, debt.currency)} paid · {pct.toFixed(0)}%</p>
                    </div>
                  )}

                  {daysLeft !== null && debt.status !== "settled" && (
                    <div className="flex items-center gap-1.5 mt-2">
                      {isOverdue ? <AlertTriangle size={13} style={{ color: "#dc2626" }} /> : <Clock size={13} style={{ color: daysLeft <= 7 ? "#d97706" : "var(--muted)" }} />}
                      <span className="text-xs" style={{ color: isOverdue ? "#dc2626" : daysLeft <= 7 ? "#d97706" : "var(--muted)" }}>
                        {isOverdue ? `${Math.abs(daysLeft)} days overdue` : daysLeft === 0 ? "Due today" : `${daysLeft} days left`}
                      </span>
                    </div>
                  )}

                  {debt.status !== "settled" && (
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {paymentDebtId === debt.id ? (
                        <div className="flex gap-2 w-full flex-wrap">
                          <input type="number" min="0" placeholder="Amount" value={paymentAmount}
                            onChange={(e) => setPaymentAmount(e.target.value)}
                            className="flex-1 min-w-24 px-3 py-2 rounded-lg text-xs outline-none"
                            style={{ background: "var(--background)", border: "1px solid var(--border)", color: "var(--foreground)" }} />
                          <input type="text" placeholder="Note (optional)" value={paymentNote}
                            onChange={(e) => setPaymentNote(e.target.value)}
                            className="flex-1 min-w-24 px-3 py-2 rounded-lg text-xs outline-none"
                            style={{ background: "var(--background)", border: "1px solid var(--border)", color: "var(--foreground)" }} />
                          <button onClick={() => handlePayment(debt.id)} className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-xs font-medium">Record</button>
                          <button onClick={() => setPaymentDebtId(null)} className="px-3 py-2 rounded-lg text-xs"
                            style={{ background: "var(--background)", color: "var(--muted)", border: "1px solid var(--border)" }}>✕</button>
                        </div>
                      ) : (
                        <>
                          <button onClick={() => setPaymentDebtId(debt.id)}
                            className="px-3 py-2 rounded-lg text-xs font-medium transition-colors hover:bg-indigo-600 hover:text-white"
                            style={{ border: "1px solid var(--border)", color: "var(--muted)" }}>+ Record Payment</button>
                          <button onClick={() => settleDebt(debt.id)}
                            className="px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors hover:bg-green-600 hover:text-white"
                            style={{ border: "1px solid var(--border)", color: "var(--muted)" }}>
                            <CheckCircle size={12} /> Mark Settled
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {debt.payments.length > 0 && (
                  <>
                    <button onClick={() => setExpandedId(isExpanded ? null : debt.id)}
                      className="w-full flex items-center justify-between px-5 py-2.5 text-xs font-medium"
                      style={{ borderTop: "1px solid var(--border)", color: "var(--muted)", background: "var(--background)" }}>
                      Payment History ({debt.payments.length})
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                          <div className="px-5 pb-4 flex flex-col gap-2">
                            {debt.payments.map((p) => (
                              <div key={p.id} className="flex items-center justify-between py-2" style={{ borderBottom: "1px solid var(--border)" }}>
                                <div>
                                  <p className="text-xs font-medium" style={{ color: "var(--foreground)" }}>{formatCurrency(p.amount, debt.currency)}</p>
                                  {p.note && <p className="text-xs" style={{ color: "var(--muted)" }}>{p.note}</p>}
                                </div>
                                <p className="text-xs" style={{ color: "var(--muted)" }}>{format(parseISO(p.date), "MMM d, yyyy")}</p>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                )}

                <div className="flex justify-end px-5 pb-3">
                  <button onClick={() => deleteDebt(debt.id)}
                    className="text-xs flex items-center gap-1 hover:text-red-500 transition-colors"
                    style={{ color: "var(--muted)" }}>
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-24" style={{ color: "var(--muted)" }}>
          <p className="text-4xl mb-3">🤝</p>
          <p className="text-sm">No debts recorded yet.</p>
        </div>
      )}
    </div>
  );
}
