"use client";
import { useEffect } from "react";
import {
  collection, doc, onSnapshot, setDoc, deleteDoc, query, orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useFinanceStore, Transaction, Budget, SavingsGoal, Debt, DebtPayment } from "@/store/useFinanceStore";

// Firestore does NOT accept undefined values — strip them recursively before saving
function clean<T extends object>(obj: T): T {
  const result: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    if (Array.isArray(v)) {
      result[k] = v.map((item) =>
        item && typeof item === "object" ? clean(item as object) : item
      );
    } else if (typeof v === "object") {
      result[k] = clean(v as object);
    } else {
      result[k] = v;
    }
  }
  return result as T;
}

export function useFirestoreSync(uid: string) {
  useEffect(() => {
    if (!uid) return;

    const txRef = collection(db, "users", uid, "transactions");
    const unsubTx = onSnapshot(query(txRef, orderBy("date", "desc")), (snap) => {
      const txs: Transaction[] = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Transaction));
      useFinanceStore.setState({ transactions: txs });
    });

    const budRef = collection(db, "users", uid, "budgets");
    const unsubBud = onSnapshot(budRef, (snap) => {
      const buds: Budget[] = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Budget));
      useFinanceStore.setState({ budgets: buds });
    });

    const goalRef = collection(db, "users", uid, "goals");
    const unsubGoal = onSnapshot(goalRef, (snap) => {
      const goals: SavingsGoal[] = snap.docs.map((d) => ({ id: d.id, ...d.data() } as SavingsGoal));
      useFinanceStore.setState({ goals });
    });

    const debtRef = collection(db, "users", uid, "debts");
    const unsubDebt = onSnapshot(query(debtRef, orderBy("date", "desc")), (snap) => {
      const debts: Debt[] = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Debt));
      useFinanceStore.setState({ debts });
    });

    return () => { unsubTx(); unsubBud(); unsubGoal(); unsubDebt(); };
  }, [uid]);

  useEffect(() => {
    if (!uid) return;

    useFinanceStore.setState({
      addTransaction: async (t) => {
        const id = crypto.randomUUID();
        await setDoc(doc(db, "users", uid, "transactions", id), clean({ ...t, id }));
      },
      deleteTransaction: async (id) => {
        await deleteDoc(doc(db, "users", uid, "transactions", id));
      },
      addBudget: async (b) => {
        const id = crypto.randomUUID();
        await setDoc(doc(db, "users", uid, "budgets", id), clean({ ...b, id }));
      },
      updateBudget: async (id, limit) => {
        const existing = useFinanceStore.getState().budgets.find((b) => b.id === id);
        if (existing) await setDoc(doc(db, "users", uid, "budgets", id), clean({ ...existing, limit }));
      },
      deleteBudget: async (id) => {
        await deleteDoc(doc(db, "users", uid, "budgets", id));
      },
      addGoal: async (g) => {
        const id = crypto.randomUUID();
        await setDoc(doc(db, "users", uid, "goals", id), clean({ ...g, id }));
      },
      updateGoalSaved: async (id, amount) => {
        const existing = useFinanceStore.getState().goals.find((g) => g.id === id);
        if (existing) {
          const saved = Math.min(existing.saved + amount, existing.target);
          await setDoc(doc(db, "users", uid, "goals", id), clean({ ...existing, saved }));
        }
      },
      deleteGoal: async (id) => {
        await deleteDoc(doc(db, "users", uid, "goals", id));
      },
      addDebt: async (d) => {
        const id = crypto.randomUUID();
        const debt: Debt = { ...d, id, amountPaid: 0, status: "pending", payments: [] };
        await setDoc(doc(db, "users", uid, "debts", id), clean(debt));
      },
      recordDebtPayment: async (debtId, payment) => {
        const existing = useFinanceStore.getState().debts.find((d) => d.id === debtId);
        if (!existing) return;
        const newPayment: DebtPayment = { ...payment, id: crypto.randomUUID() };
        const amountPaid = existing.amountPaid + payment.amount;
        const status = amountPaid >= existing.amount ? "settled" : "partial";
        const updated: Debt = { ...existing, amountPaid, status, payments: [...existing.payments, clean(newPayment)] };
        await setDoc(doc(db, "users", uid, "debts", debtId), clean(updated));
      },
      settleDebt: async (debtId) => {
        const existing = useFinanceStore.getState().debts.find((d) => d.id === debtId);
        if (!existing) return;
        await setDoc(doc(db, "users", uid, "debts", debtId), clean({ ...existing, amountPaid: existing.amount, status: "settled" }));
      },
      deleteDebt: async (id) => {
        await deleteDoc(doc(db, "users", uid, "debts", id));
      },
    });
  }, [uid]);
}
