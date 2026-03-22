import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Category =
  | "Food"
  | "Transport"
  | "Rent"
  | "Entertainment"
  | "Health"
  | "Shopping"
  | "Salary"
  | "Investment"
  | "Other";

export type TransactionType = "income" | "expense" | "transfer";

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: Category;
  date: string; // ISO string
  note?: string;
  recurring?: boolean;
  currency?: string;
}

export interface Budget {
  id: string;
  category: Category;
  limit: number;
  month: string; // "YYYY-MM"
}

export interface SavingsGoal {
  id: string;
  title: string;
  target: number;
  saved: number;
  deadline?: string;
  emoji?: string;
}

interface FinanceState {
  transactions: Transaction[];
  budgets: Budget[];
  goals: SavingsGoal[];
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
  toggleDarkMode: () => void;
  setCurrency: (c: string) => void;
}

const SAMPLE_TRANSACTIONS: Transaction[] = [
  { id: "1", title: "Monthly Salary", amount: 5000, type: "income", category: "Salary", date: new Date(Date.now() - 86400000 * 2).toISOString(), recurring: true },
  { id: "2", title: "Grocery Shopping", amount: 120, type: "expense", category: "Food", date: new Date(Date.now() - 86400000 * 1).toISOString() },
  { id: "3", title: "Netflix Subscription", amount: 15, type: "expense", category: "Entertainment", date: new Date(Date.now() - 86400000 * 3).toISOString(), recurring: true },
  { id: "4", title: "Uber Ride", amount: 22, type: "expense", category: "Transport", date: new Date(Date.now() - 86400000 * 4).toISOString() },
  { id: "5", title: "Rent Payment", amount: 1200, type: "expense", category: "Rent", date: new Date(Date.now() - 86400000 * 5).toISOString(), recurring: true },
  { id: "6", title: "Freelance Project", amount: 800, type: "income", category: "Investment", date: new Date(Date.now() - 86400000 * 6).toISOString() },
  { id: "7", title: "Gym Membership", amount: 45, type: "expense", category: "Health", date: new Date(Date.now() - 86400000 * 7).toISOString(), recurring: true },
  { id: "8", title: "Amazon Purchase", amount: 89, type: "expense", category: "Shopping", date: new Date(Date.now() - 86400000 * 8).toISOString() },
];

const SAMPLE_BUDGETS: Budget[] = [
  { id: "b1", category: "Food", limit: 400, month: new Date().toISOString().slice(0, 7) },
  { id: "b2", category: "Transport", limit: 150, month: new Date().toISOString().slice(0, 7) },
  { id: "b3", category: "Entertainment", limit: 100, month: new Date().toISOString().slice(0, 7) },
  { id: "b4", category: "Shopping", limit: 300, month: new Date().toISOString().slice(0, 7) },
  { id: "b5", category: "Health", limit: 200, month: new Date().toISOString().slice(0, 7) },
];

const SAMPLE_GOALS: SavingsGoal[] = [
  { id: "g1", title: "Flight to Japan", target: 3000, saved: 1200, deadline: "2026-12-01", emoji: "✈️" },
  { id: "g2", title: "New MacBook", target: 2500, saved: 800, deadline: "2026-09-01", emoji: "💻" },
  { id: "g3", title: "Emergency Fund", target: 10000, saved: 4500, emoji: "🛡️" },
];

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set) => ({
      transactions: SAMPLE_TRANSACTIONS,
      budgets: SAMPLE_BUDGETS,
      goals: SAMPLE_GOALS,
      darkMode: false,
      currency: "USD",

      addTransaction: (t) =>
        set((s) => ({
          transactions: [{ ...t, id: crypto.randomUUID() }, ...s.transactions],
        })),

      deleteTransaction: (id) =>
        set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) })),

      addBudget: (b) =>
        set((s) => ({ budgets: [...s.budgets, { ...b, id: crypto.randomUUID() }] })),

      updateBudget: (id, limit) =>
        set((s) => ({ budgets: s.budgets.map((b) => (b.id === id ? { ...b, limit } : b)) })),

      deleteBudget: (id) =>
        set((s) => ({ budgets: s.budgets.filter((b) => b.id !== id) })),

      addGoal: (g) =>
        set((s) => ({ goals: [...s.goals, { ...g, id: crypto.randomUUID() }] })),

      updateGoalSaved: (id, amount) =>
        set((s) => ({
          goals: s.goals.map((g) => (g.id === id ? { ...g, saved: Math.min(g.saved + amount, g.target) } : g)),
        })),

      deleteGoal: (id) =>
        set((s) => ({ goals: s.goals.filter((g) => g.id !== id) })),

      toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
      setCurrency: (currency) => set({ currency }),
    }),
    { name: "money-master-store" }
  )
);

// Selectors
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
