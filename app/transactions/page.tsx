"use client";
import { useState } from "react";
import { useFinanceStore, CATEGORIES, CATEGORY_ICONS, TransactionType } from "@/store/useFinanceStore";
import { formatCurrency } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { Trash2, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AddTransactionModal from "@/components/transactions/AddTransactionModal";
import { t } from "@/lib/translations";

export default function TransactionsPage() {
  const { transactions, deleteTransaction, currency, lang } = useFinanceStore();
  const tr = t(lang);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<TransactionType | "all">("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const filtered = transactions.filter((t) => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "all" || t.type === filterType;
    const matchCat = filterCategory === "all" || t.category === filterCategory;
    return matchSearch && matchType && matchCat;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold" style={{ color: "var(--foreground)" }}>{tr.transactionsTitle}</h1>
          <p className="text-xs md:text-sm mt-1" style={{ color: "var(--muted)" }}>{filtered.length} {tr.transactions}</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 md:px-5 md:py-2.5 rounded-xl text-sm font-medium"
        >
          + {tr.addTransaction}
        </motion.button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl flex-1"
          style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <Search size={15} style={{ color: "var(--muted)" }} />
          <input
            placeholder={tr.searchTransactions}
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none text-sm flex-1"
            style={{ color: "var(--foreground)" }}
          />
        </div>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value as TransactionType | "all")}
          className="px-3 py-2.5 rounded-xl text-sm outline-none"
          style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--foreground)" }}>
          <option value="all">{tr.allTypes}</option>
          <option value="income">{tr.income}</option>
          <option value="expense">{tr.expense}</option>
          <option value="transfer">{tr.transfer}</option>
        </select>
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-2.5 rounded-xl text-sm outline-none"
          style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--foreground)" }}>
          <option value="all">{tr.allCategories}</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>)}
        </select>
      </div>

      {/* Cards on mobile, table on desktop */}
      <div className="md:hidden flex flex-col gap-3">
        <AnimatePresence>
          {filtered.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              transition={{ delay: i * 0.02 }}
              className="rounded-xl p-4 flex items-center justify-between"
              style={{ background: "var(--card)", border: "1px solid var(--border)" }}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{CATEGORY_ICONS[t.category]}</span>
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{t.title}</p>
                  <p className="text-xs" style={{ color: "var(--muted)" }}>
                    {format(parseISO(t.date), "MMM d")} · {t.category}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold"
                  style={{ color: t.type === "income" ? "var(--income)" : "var(--expense)" }}>
                  {t.type === "income" ? "+" : "-"}{formatCurrency(t.amount, currency)}
                </span>
                <button onClick={() => deleteTransaction(t.id)} style={{ color: "var(--muted)" }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block rounded-2xl overflow-hidden" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        <div className="grid grid-cols-5 px-6 py-3 text-xs font-semibold uppercase tracking-wide"
          style={{ color: "var(--muted)", borderBottom: "1px solid var(--border)" }}>
          <span>Transaction</span><span>Category</span><span>Date</span><span>Type</span><span className="text-right">Amount</span>
        </div>
        <AnimatePresence>
          {filtered.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ delay: i * 0.02 }}
              className="grid grid-cols-5 px-6 py-4 items-center group"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{CATEGORY_ICONS[t.category]}</span>
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{t.title}</p>
                  {tr.recurring && <span className="text-xs" style={{ color: "var(--muted)" }}>🔄 {tr.recurring}</span>}
                </div>
              </div>
              <span className="text-sm" style={{ color: "var(--muted)" }}>{t.category}</span>
              <span className="text-sm" style={{ color: "var(--muted)" }}>{format(parseISO(t.date), "MMM d, yyyy")}</span>
              <span className={`text-xs font-medium px-2 py-1 rounded-full w-fit capitalize ${
                t.type === "income" ? "bg-green-100 text-green-700" :
                t.type === "expense" ? "bg-red-100 text-red-700" : "bg-indigo-100 text-indigo-700"
              }`}>{t.type}</span>
              <div className="flex items-center justify-end gap-3">
                <span className="font-semibold text-sm"
                  style={{ color: t.type === "income" ? "var(--income)" : "var(--expense)" }}>
                  {t.type === "income" ? "+" : "-"}{formatCurrency(t.amount, currency)}
                </span>
                <button onClick={() => deleteTransaction(t.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: "var(--expense)" }}>
                  <Trash2 size={15} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {filtered.length === 0 && (
          <p className="text-center py-16 text-sm" style={{ color: "var(--muted)" }}>No transactions found</p>
        )}
      </div>

      {showModal && <AddTransactionModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
