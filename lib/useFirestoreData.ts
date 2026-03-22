"use client";
import { useEffect } from "react";
import {
  collection, doc, onSnapshot, setDoc, deleteDoc, query, orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useFinanceStore, Transaction, Budget, SavingsGoal } from "@/store/useFinanceStore";

export function useFirestoreSync(uid: string) {
  const store = useFinanceStore();

  useEffect(() => {
    if (!uid) return;

    // Transactions
    const txRef = collection(db, "users", uid, "transactions");
    const unsubTx = onSnapshot(query(txRef, orderBy("date", "desc")), (snap) => {
      const txs: Transaction[] = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Transaction));
      useFinanceStore.setState({ transactions: txs });
    });

    // Budgets
    const budRef = collection(db, "users", uid, "budgets");
    const unsubBud = onSnapshot(budRef, (snap) => {
      const buds: Budget[] = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Budget));
      useFinanceStore.setState({ budgets: buds });
    });

    // Goals
    const goalRef = collection(db, "users", uid, "goals");
    const unsubGoal = onSnapshot(goalRef, (snap) => {
      const goals: SavingsGoal[] = snap.docs.map((d) => ({ id: d.id, ...d.data() } as SavingsGoal));
      useFinanceStore.setState({ goals });
    });

    return () => { unsubTx(); unsubBud(); unsubGoal(); };
  }, [uid]);

  // Write helpers — override store actions to also write to Firestore
  useEffect(() => {
    if (!uid) return;

    useFinanceStore.setState({
      addTransaction: async (t) => {
        const id = crypto.randomUUID();
        const tx = { ...t, id };
        await setDoc(doc(db, "users", uid, "transactions", id), tx);
      },
      deleteTransaction: async (id) => {
        await deleteDoc(doc(db, "users", uid, "transactions", id));
      },
      addBudget: async (b) => {
        const id = crypto.randomUUID();
        await setDoc(doc(db, "users", uid, "budgets", id), { ...b, id });
      },
      updateBudget: async (id, limit) => {
        const existing = useFinanceStore.getState().budgets.find((b) => b.id === id);
        if (existing) await setDoc(doc(db, "users", uid, "budgets", id), { ...existing, limit });
      },
      deleteBudget: async (id) => {
        await deleteDoc(doc(db, "users", uid, "budgets", id));
      },
      addGoal: async (g) => {
        const id = crypto.randomUUID();
        await setDoc(doc(db, "users", uid, "goals", id), { ...g, id });
      },
      updateGoalSaved: async (id, amount) => {
        const existing = useFinanceStore.getState().goals.find((g) => g.id === id);
        if (existing) {
          const saved = Math.min(existing.saved + amount, existing.target);
          await setDoc(doc(db, "users", uid, "goals", id), { ...existing, saved });
        }
      },
      deleteGoal: async (id) => {
        await deleteDoc(doc(db, "users", uid, "goals", id));
      },
    });
  }, [uid]);
}
