import { create } from "zustand";

export type Category =
  | "Food" | "Transport" | "Rent" | "Entertainment"
  | "Health" | "Shopping" | "Salary" | "Investment" | "Other";

export type TransactionType = "income" | "expense" | "transfer";

export type DebtDirection = "owed_to_me" | "i_owe"; // owed_to_me = חייבים לי, i_owe = אני חייב
export type DebtStatus = "pending" | "partial" | "settled";

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: Category;
  date: string;
  note?: string;
  recurring?: boolean;
  currency?: string;
}

export interface Budget {
  id: string;
  category: Category;
  limit: number;
  month: string;
}

export interface SavingsGoal {
  id: string;
  title: string;
  target: number;
  saved: number;
  deadline?: string;
  emoji?: string;
}

export interface DebtPayment {
  id: string;
  amount: number;
  date: string;
  note?: string;
}

export interface Debt {
  id: string;
  direction: DebtDirection;
  personName: string;
  amount: number;          // original amount
  amountPaid: number;      // how much has been paid back
  currency: string;
  date: string;            // when the debt was created
  dueDate?: string;        // deadline to pay back
  reason: string;          // what it's for
  note?: string;
  status: DebtStatus;
  payments: DebtPayment[]; // payment history
}

interface FinanceState {
  transactions: Transaction[];
  budgets: Budget[];
  goals: SavingsGoal[];
  debts: Debt[];
  darkMode: boolean;
  currency: string;
  addTransaction: (t: Omit<Transaction, "id">) => void;
  deleteTransaction: (id: string) => void;
  addBudget: (b: Omit<Budget, "id">) => void;
  updateBudget: (id: string, limit: number) => void;
  deleteBudget: (id: string) => void;
  addGoal: (g: Omit<SavingsGoal, "id">) => void;
  updateGoalSaved: (id: string, amount: number) => void;
  deleteGoal: (id: string) => void;
  addDebt: (d: Omit<Debt, "id" | "amountPaid" | "status" | "payments">) => void;
  recordDebtPayment: (debtId: string, payment: Omit<DebtPayment, "id">) => void;
  settleDebt: (debtId: string) => void;
  deleteDebt: (id: string) => void;
  toggleDarkMode: () => void;
  setCurrency: (c: string) => void;
}

export const useFinanceStore = create<FinanceState>()((set) => ({
  transactions: [],
  budgets: [],
  goals: [],
  debts: [],
  darkMode: false,
  currency: "USD",

  addTransaction: (t) =>
    set((s) => ({ transactions: [{ ...t, id: crypto.randomUUID() }, ...s.transactions] })),
  deleteTransaction: (id) =>
    set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) })),
  addBudget: (b) =>
    set((s) => ({ budgets: [...s.budgets, { ...b, id: crypto.randomUUID() }] })),
  updateBudget: (id, limit) =>
    set((s) => ({ budgets: s.budgets.map((b) => b.id === id ? { ...b, limit } : b) })),
  deleteBudget: (id) =>
    set((s) => ({ budgets: s.budgets.filter((b) => b.id !== id) })),
  addGoal: (g) =>
    set((s) => ({ goals: [...s.goals, { ...g, id: crypto.randomUUID() }] })),
  updateGoalSaved: (id, amount) =>
    set((s) => ({
      goals: s.goals.map((g) => g.id === id ? { ...g, saved: Math.min(g.saved + amount, g.target) } : g),
    })),
  deleteGoal: (id) =>
    set((s) => ({ goals: s.goals.filter((g) => g.id !== id) })),

  addDebt: (d) =>
    set((s) => ({
      debts: [{ ...d, id: crypto.randomUUID(), amountPaid: 0, status: "pending", payments: [] }, ...s.debts],
    })),

  recordDebtPayment: (debtId, payment) =>
    set((s) => ({
      debts: s.debts.map((d) => {
        if (d.id !== debtId) return d;
        const newPayment: DebtPayment = { ...payment, id: crypto.randomUUID() };
        const amountPaid = d.amountPaid + payment.amount;
        const status: DebtStatus = amountPaid >= d.amount ? "settled" : "partial";
        return { ...d, amountPaid, status, payments: [...d.payments, newPayment] };
      }),
    })),

  settleDebt: (debtId) =>
    set((s) => ({
      debts: s.debts.map((d) =>
        d.id === debtId ? { ...d, amountPaid: d.amount, status: "settled" } : d
      ),
    })),

  deleteDebt: (id) =>
    set((s) => ({ debts: s.debts.filter((d) => d.id !== id) })),

  toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
  setCurrency: (currency) => set({ currency }),
}));

export const CATEGORIES: Category[] = [
  "Food", "Transport", "Rent", "Entertainment", "Health", "Shopping", "Salary", "Investment", "Other",
];

export const CATEGORY_ICONS: Record<Category, string> = {
  Food: "🍔", Transport: "🚗", Rent: "🏠", Entertainment: "🎬",
  Health: "💊", Shopping: "🛍️", Salary: "💰", Investment: "📈", Other: "📦",
};

export const CATEGORY_COLORS: Record<Category, string> = {
  Food: "#f97316", Transport: "#3b82f6", Rent: "#8b5cf6", Entertainment: "#ec4899",
  Health: "#22c55e", Shopping: "#f59e0b", Salary: "#10b981", Investment: "#6366f1", Other: "#94a3b8",
};

export const CURRENCIES = ["USD", "EUR", "GBP", "JPY", "ILS", "CAD", "AUD"];

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$", EUR: "€", GBP: "£", JPY: "¥", ILS: "₪", CAD: "CA$", AUD: "A$",
};
