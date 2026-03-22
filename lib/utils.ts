import { Transaction, Budget, CURRENCY_SYMBOLS } from "@/store/useFinanceStore";
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from "date-fns";

export function formatCurrency(amount: number, currency = "USD"): string {
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency;
  return `${symbol}${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function getMonthTransactions(transactions: Transaction[], month?: string): Transaction[] {
  const target = month ?? format(new Date(), "yyyy-MM");
  const [year, mon] = target.split("-").map(Number);
  const start = startOfMonth(new Date(year, mon - 1));
  const end = endOfMonth(new Date(year, mon - 1));
  return transactions.filter((t) =>
    isWithinInterval(parseISO(t.date), { start, end })
  );
}

export function getSpentForBudget(transactions: Transaction[], budget: Budget): number {
  return getMonthTransactions(transactions, budget.month)
    .filter((t) => t.type === "expense" && t.category === budget.category)
    .reduce((sum, t) => sum + t.amount, 0);
}

export function getTotalIncome(transactions: Transaction[]): number {
  return transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
}

export function getTotalExpenses(transactions: Transaction[]): number {
  return transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
}

export function getNetBalance(transactions: Transaction[]): number {
  return getTotalIncome(transactions) - getTotalExpenses(transactions);
}

export function getCategoryBreakdown(transactions: Transaction[]) {
  const map: Record<string, number> = {};
  transactions.filter((t) => t.type === "expense").forEach((t) => {
    map[t.category] = (map[t.category] ?? 0) + t.amount;
  });
  return Object.entries(map).map(([name, value]) => ({ name, value }));
}

export function getMonthlyTrend(transactions: Transaction[]) {
  const map: Record<string, { income: number; expense: number }> = {};
  transactions.forEach((t) => {
    const month = format(parseISO(t.date), "MMM");
    if (!map[month]) map[month] = { income: 0, expense: 0 };
    if (t.type === "income") map[month].income += t.amount;
    if (t.type === "expense") map[month].expense += t.amount;
  });
  return Object.entries(map).map(([month, data]) => ({ month, ...data }));
}

export function getSpendingHeatmap(transactions: Transaction[]) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const map: Record<string, number> = {};
  days.forEach((d) => (map[d] = 0));
  transactions.filter((t) => t.type === "expense").forEach((t) => {
    const day = days[parseISO(t.date).getDay()];
    map[day] += t.amount;
  });
  return days.map((day) => ({ day, amount: map[day] }));
}
