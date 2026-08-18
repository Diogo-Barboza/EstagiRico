import { getCurrentCycleDates, isInCycle, fmtCurrency } from "@/lib/utils";
import { useMemo, useState } from "react";
import type { Expense, Person } from "../../lib/types";
import { CATEGORY_META } from "@/lib/constants";
import { Pencil } from "lucide-react";
import { EditExpenseModal } from "./EditExpenseModal";

interface TransactionsViewProps {
  expenses: Expense[];
  closingDay: number;
  people: Person[];
  onUpdateExpense?: (expense: Expense) => void;
  onDelete?: (id: string) => void;
}

export function TransactionsView({
  expenses,
  closingDay,
  people,
  onUpdateExpense,
  onDelete,
}: TransactionsViewProps) {
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const cycle = useMemo(() => getCurrentCycleDates(closingDay), [closingDay]);

  const cycleExp = useMemo(
    () =>
      expenses.filter((e) => isInCycle(e.date, cycle.startDate, cycle.endDate)),
    [expenses, cycle],
  );

  const transacoes = [...cycleExp].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="flex flex-col gap-4 pb-4">
      {transacoes.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#EDEEF5] overflow-hidden">
          <div className="px-5 pt-5 pb-3 flex items-center justify-between">
            <p className="text-xs font-semibold text-[#1A1E2D]">
              Transações do ciclo
            </p>
            <span className="text-[10px] text-[#9BA3AF] font-medium">
              {cycleExp.length} no total
            </span>
          </div>
          <div className="divide-y divide-[#F4F5F8]">
            {transacoes.map((exp) => {
              const meta = CATEGORY_META[exp.category];
              const person = exp.payeeId
                ? people.find((p) => p.id === exp.payeeId)
                : null;
              const dateLabel = new Date(
                exp.date + "T12:00:00",
              ).toLocaleDateString("pt-BR", {
                day: "numeric",
                month: "short",
              });
              return (
                <div
                  key={exp.id}
                  className="flex items-center gap-3 px-5 py-3 bg-white rounder-2xl gap-3 group hover:bg-[#FAFAFA]"
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0"
                    style={{ background: meta.bg }}
                  >
                    {meta.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-[#1A1E2D] truncate">
                        {exp.title}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[11px] text-[#9BA3AF]">
                        {dateLabel}
                      </span>
                      {person && (
                        <>
                          <span className="text-[#C8CADB] text-[11px]">·</span>
                          <span
                            className="text-[11px] font-medium"
                            style={{ color: person.color }}
                          >
                            {person.name}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p
                      className="text-sm font-semibold"
                      style={{
                        fontFamily: "DM Mono, monospace",
                        color:
                          exp.payeeType === "third-party"
                            ? "#3D9E8C"
                            : "#1A1E2D",
                      }}
                    >
                      {fmtCurrency(exp.amount)}
                    </p>
                    {exp.payeeType === "third-party" && (
                      <p className="text-[9px] text-[#3D9E8C] font-medium uppercase tracking-wide">
                        Deve
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setEditingExpense(exp)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-[#C8CADB] hover:text-[#D85F5F] hover:bg-[#FCEAEA] transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Pencil size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <div className="fixed z-50 bg-black/50">
        {editingExpense && (
          <EditExpenseModal
            expense={editingExpense}
            onClose={() => setEditingExpense(null)}
            onSave={(updatedFields) => {
              onUpdateExpense?.({ ...editingExpense, ...updatedFields });
              setEditingExpense(null);
            }}
            onDelete={onDelete}
          />
        )}
      </div>
    </div>
  );
}
