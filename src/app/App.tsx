import { useState, useCallback, useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { DollarSign, AlertCircle } from "lucide-react";
import { useMemo } from "react";

import { supabase } from "../lib/supabase";
import type { View, Expense, Person, Category, PayeeType } from "../lib/types";

import { LoadingScreen } from "./components/LoadingScreen";
import { AuthScreen } from "./components/AuthScreen";
import { Sidebar } from "./components/Sidebar";
import { BottomNav } from "./components/BottomNav";
import { Dashboard } from "./components/Dashboard";
import { AddExpense } from "./components/AddExpense";
import { PeopleView } from "./components/PeopleView";
import { SettingsView } from "./components/SettingsView";
import { TransactionsView } from "./components/TransactionsView";

const VIEW_TITLE: Record<View, string> = {
  dashboard: "Visão Geral",
  add: "Registrar Gasto",
  people: "Pessoas",
  expenses: "Transações",
  settings: "Configurações",
};

export default function App() {
  // ── Auth state ──
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // ── Data state ──
  const [view, setView] = useState<View>("dashboard");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [closingDay, setClosingDay] = useState(25);
  const [budget, setBudget] = useState(1800);

  // ── Async operation states ──
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);
  const [savingExpense, setSavingExpense] = useState(false);
  const [addingPerson, setAddingPerson] = useState(false);
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // ── Auth listener ──
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── Fetch all data on login ──
  const fetchAllData = useCallback(
    async (userId: string) => {
      setDataLoading(true);
      setDataError(null);
      try {
        // Fetch or create profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("closing_day, monthly_budget")
          .eq("id", userId)
          .single();

        if (profileError && profileError.code === "PGRST116") {
          await supabase.from("profiles").insert({
            id: userId,
            email: session?.user?.email || "",
            closing_day: 25,
            monthly_budget: 1800,
          });
          setClosingDay(25);
          setBudget(1800);
        } else if (profileError) {
          throw profileError;
        } else if (profileData) {
          setClosingDay(profileData.closing_day ?? 25);
          setBudget(profileData.monthly_budget ?? 1800);
        }

        // Fetch people
        const { data: peopleData, error: peopleError } = await supabase
          .from("people")
          .select("id, name, color")
          .eq("user_id", userId)
          .order("name");

        if (peopleError) throw peopleError;
        setPeople(
          (peopleData || []).map((p) => ({
            id: p.id,
            name: p.name,
            color: p.color,
          })),
        );

        // Fetch expenses
        const { data: expensesData, error: expensesError } = await supabase
          .from("expenses")
          .select("id, title, amount, category, date, payee_type, payee_id")
          .eq("user_id", userId)
          .order("date", { ascending: false });

        if (expensesError) throw expensesError;
        setExpenses(
          (expensesData || []).map((e) => ({
            id: e.id,
            title: e.title,
            amount: Number(e.amount),
            category: e.category as Category,
            date: e.date,
            payeeType: e.payee_type as PayeeType,
            payeeId: e.payee_id || undefined,
          })),
        );
      } catch (err: any) {
        console.error("Error fetching data:", err);
        setDataError("Erro ao carregar dados. Tente novamente.");
      } finally {
        setDataLoading(false);
      }
    },
    [session],
  );

  useEffect(() => {
    if (session?.user?.id) {
      fetchAllData(session.user.id);
    }
  }, [session?.user?.id, fetchAllData]);

  // ── CRUD: Expenses ──
  const addExpense = useCallback(
    async (expense: Omit<Expense, "id">) => {
      if (!session?.user?.id) return;
      setSavingExpense(true);
      try {
        const { data, error } = await supabase
          .from("expenses")
          .insert({
            user_id: session.user.id,
            title: expense.title,
            amount: expense.amount,
            category: expense.category,
            date: expense.date,
            payee_type: expense.payeeType,
            payee_id: expense.payeeId || null,
          })
          .select("id, title, amount, category, date, payee_type, payee_id")
          .single();

        if (error) throw error;
        if (data) {
          setExpenses((prev) => [
            {
              id: data.id,
              title: data.title,
              amount: Number(data.amount),
              category: data.category as Category,
              date: data.date,
              payeeType: data.payee_type as PayeeType,
              payeeId: data.payee_id || undefined,
            },
            ...prev,
          ]);
        }
        setView("dashboard");
      } catch (err: any) {
        console.error("Error adding expense:", err);
        alert("Erro ao salvar despesa. Tente novamente.");
      } finally {
        setSavingExpense(false);
      }
    },
    [session],
  );

  const deleteExpese = useCallback(
    async (expenseId: string) => {
      if (!session?.user?.id) return;
      try {
        const { error } = await supabase
          .from("expenses")
          .delete()
          .eq("id", expenseId)
          .eq("user_id", session.user.id);

        if (error) throw error;

        setExpenses((prev) => prev.filter((item) => item.id !== expenseId));
      } catch (err) {
        console.error("Erro ao deletar despesa: ", err);
        alert("Não foi possível deletar despesa.");
      }
    },
    [session],
  );

  const updateExpense = useCallback(
    async (updateExpense: Expense) => {
      if (!session?.user?.id) return;

      try {
        const { error } = await supabase
          .from("expenses")
          .update({
            title: updateExpense.title,
            amount: updateExpense.amount,
            category: updateExpense.category,
            date: updateExpense.date,
          })
          .eq("id", updateExpense.id)
          .eq("user_id", session.user.id);

        if (error) throw error;

        setExpenses((prev) =>
          prev.filter((item) =>
            item.id === updateExpense.id ? updateExpense : item,
          ),
        );
      } catch (err) {
        console.log("Não foi possivel atualizar despesa: ", err);
        alert("Não foi possível atualizar despesa.");
      }
    },
    [session],
  );

  // ── Filtros ──

  const selectedMonth = "2026-08";
  const montlhyExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      return expense.date.startsWith(selectedMonth);
    });
  }, [expenses, selectedMonth]);

  // ── CRUD: People ──
  const addPerson = useCallback(
    async (name: string, color: string) => {
      if (!session?.user?.id) return;
      setAddingPerson(true);
      try {
        const { data, error } = await supabase
          .from("people")
          .insert({ user_id: session.user.id, name, color })
          .select("id, name, color")
          .single();

        if (error) throw error;
        if (data) {
          setPeople((prev) => [
            ...prev,
            { id: data.id, name: data.name, color: data.color },
          ]);
        }
      } catch (err: any) {
        console.error("Error adding person:", err);
        alert("Erro ao adicionar pessoa. Tente novamente.");
      } finally {
        setAddingPerson(false);
      }
    },
    [session],
  );

  const deletePerson = useCallback(
    async (id: string) => {
      if (!session?.user?.id) return;
      try {
        const { error } = await supabase
          .from("people")
          .delete()
          .eq("id", id)
          .eq("user_id", session.user.id);

        if (error) throw error;
        setPeople((prev) => prev.filter((p) => p.id !== id));
      } catch (err: any) {
        console.error("Error deleting person:", err);
        alert("Erro ao remover pessoa. Tente novamente.");
      }
    },
    [session],
  );

  // ── CRUD: Profile ──
  const updateClosingDay = useCallback(
    async (day: number) => {
      setClosingDay(day);
      if (!session?.user?.id) return;
      setUpdatingProfile(true);
      try {
        const { error } = await supabase
          .from("profiles")
          .update({ closing_day: day })
          .eq("id", session.user.id);
        if (error) throw error;
      } catch (err: any) {
        console.error("Error updating closing day:", err);
      } finally {
        setUpdatingProfile(false);
      }
    },
    [session],
  );

  const updateBudget = useCallback(
    async (b: number) => {
      setBudget(b);
      if (!session?.user?.id) return;
      setUpdatingProfile(true);
      try {
        const { error } = await supabase
          .from("profiles")
          .update({ monthly_budget: b })
          .eq("id", session.user.id);
        if (error) throw error;
      } catch (err: any) {
        console.error("Error updating budget:", err);
      } finally {
        setUpdatingProfile(false);
      }
    },
    [session],
  );

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setExpenses([]);
    setPeople([]);
    setView("dashboard");
  }, []);

  // ── Render ──
  if (authLoading) return <LoadingScreen />;
  if (!session) return <AuthScreen onAuth={() => {}} />;
  if (dataLoading) return <LoadingScreen />;

  return (
    <div
      className="min-h-screen bg-[#F4F5F8] flex"
      style={{ fontFamily: "DM Sans, system-ui, sans-serif" }}
    >
      <Sidebar view={view} onChange={setView} />

      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Mobile topbar */}
        <header className="lg:hidden sticky top-0 z-40 bg-[#F4F5F8]/80 backdrop-blur-xl border-b border-[#EDEEF5]/60 px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{
                background: "linear-gradient(145deg, #7B6FE0, #5A4FC8)",
              }}
            >
              <DollarSign size={13} color="white" strokeWidth={2.5} />
            </div>
            <span className="text-sm font-bold text-[#1A1E2D]">EstagiRico</span>
          </div>
          <span className="text-sm font-bold text-[#1A1E2D]">
            {VIEW_TITLE[view]}
          </span>
          <div className="w-16" />
        </header>

        {/* Desktop page title */}
        <div className="hidden lg:block px-8 pt-7 pb-0">
          <h1 className="text-xl font-bold text-[#1A1E2D]">
            {VIEW_TITLE[view]}
          </h1>
        </div>

        {/* Error banner */}
        {dataError && (
          <div className="mx-4 sm:mx-6 lg:mx-8 mt-4">
            <div className="flex items-start gap-2 p-3 rounded-xl bg-[#FCEAEA] border border-[#D85F5F]/20">
              <AlertCircle
                size={14}
                className="mt-0.5 shrink-0"
                style={{ color: "#D85F5F" }}
              />
              <p className="text-xs text-[#D85F5F] flex-1">{dataError}</p>
              <button
                onClick={() =>
                  session?.user?.id && fetchAllData(session.user.id)
                }
                className="text-xs font-semibold text-[#D85F5F] hover:underline shrink-0"
              >
                Tentar novamente
              </button>
            </div>
          </div>
        )}

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-6 lg:px-8 pt-4 pb-24 lg:pb-10">
          <div className="max-w-lg lg:max-w-3xl mx-auto">
            {view === "dashboard" && (
              <Dashboard
                expenses={expenses}
                people={people}
                closingDay={closingDay}
                budget={budget}
                onNav={setView}
              />
            )}
            {view === "add" && (
              <AddExpense
                people={people}
                onSave={addExpense}
                onCancel={() => setView("dashboard")}
                saving={savingExpense}
              />
            )}
            {view === "people" && (
              <PeopleView
                people={people}
                expenses={expenses}
                closingDay={closingDay}
                onAdd={addPerson}
                onDelete={deletePerson}
                addingPerson={addingPerson}
              />
            )}
            {view === "expenses" && (
              <TransactionsView
                expenses={expenses}
                closingDay={closingDay}
                people={people}
              />
            )}
            {view === "settings" && (
              <SettingsView
                closingDay={closingDay}
                budget={budget}
                onClosingDay={updateClosingDay}
                onBudget={updateBudget}
                onLogout={handleLogout}
                updatingProfile={updatingProfile}
              />
            )}
          </div>
        </main>
      </div>

      <BottomNav view={view} onChange={setView} />
    </div>
  );
}
