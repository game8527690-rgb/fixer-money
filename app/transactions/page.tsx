"use client";
import { useState } from "react";
import { useFinanceStore, CATEGORIES, CATEGORY_ICONS, TransactionType } from "@/store/useFinanceStore";
import { formatCurrency } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { Trash2, Search, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AddTransactionModal from "@/components/transactions/AddTransactionModal";

export default function TransactionsPage() {
  const { transactions, deleteTransaction, currency } = useFinanceStore();
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>Transactions</h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>{filtered.length} transactions</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium"
        >
          + Add Transaction
        </motion.button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl flex-1 min-w-48"
          style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <Search size={16} style={{ color: "var(--muted)" }} />
          <input
            placeholder="Search transactions..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none text-sm flex-1"
            style={{ color: "var(--foreground)" }}
          />
        </div>

        <select value={filterType} onChange={(e) => setFilterType(e.target.value as TransactionType | "all")}
          className="px-4 py-2.5 rounded-xl text-sm outline-none"
          style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--foreground)" }}>
          <option value="all">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
          <option value="transfer">Transfer</option>
        </select>

        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2.5 rounded-xl text-sm outline-none"
          style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--foreground)" }}>
          <option value="all">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        <div className="grid grid-cols-5 px-6 py-3 text-xs font-semibold uppercase tracking-wide"
          style={{ color: "var(--muted)", borderBottom: "1px solid var(--border)" }}>
          <span>Transaction</span>
          <span>Category</span>
          <span>Date</span>
          <span>Type</span>
          <span className="text-right">Amount</span>
        </div>

        <AnimatePresence>
          {filtered.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, height: 0 }}
              transition={{ delay: i * 0.02 }}
              className="grid grid-cols-5 px-6 py-4 items-center group"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{CATEGORY_ICONS[t.category]}</span>
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{t.title}</p>
                  {t.recurring && <span className="text-xs" style={{ color: "var(--muted)" }}>🔄 Recurring</span>}
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
