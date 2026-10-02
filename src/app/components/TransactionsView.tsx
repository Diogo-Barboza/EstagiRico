import { useMemo, useState, useRef, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import {
  Pencil,
  Calendar,
  Receipt,
  Users,
  ChevronDown,
  Check,
  Share2,
} from "lucide-react";
import {
  getCycleOptions,
  isInCycle,
  fmtCurrency,
} from "../../lib/utils";
import {
  CATEGORIES,
  CATEGORY_LABELS,
  CATEGORY_META,
} from "../../lib/constants";
import type { Expense, Person } from "../../lib/types";
import { Avatar } from "./Avatar";
import { DonutCenter } from "./DonutCenter";
import { EditExpenseModal } from "./EditExpenseModal";
import { ShareAuditModal } from "./ShareAuditModal";

interface TransactionsViewProps {
  expenses: Expense[];
  closingDay: number;
  people: Person[];
  budget?: number;
  onUpdateExpense?: (expense: Expense) => void;
  onDelete?: (id: string) => void;
}

export function TransactionsView({
  expenses,
  closingDay,
  people,
  budget = 1800,
  onUpdateExpense,
  onDelete,
}: TransactionsViewProps) {
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [sharingPerson, setSharingPerson] = useState<Person | null>(null);
  const [selectedOffset, setSelectedOffset] = useState<number>(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Generate 12 past cycles + current cycle
  const cycleOptions = useMemo(
    () => getCycleOptions(closingDay, 12, 0),
    [closingDay],
  );

  const currentCycle = useMemo(
    () =>
      cycleOptions.find((c) => c.offset === selectedOffset) || cycleOptions[0],
    [cycleOptions, selectedOffset],
  );

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter expenses for selected cycle
  const cycleExp = useMemo(
    () =>
      expenses.filter((e) =>
        isInCycle(e.date, currentCycle.startDate, currentCycle.endDate),
      ),
    [expenses, currentCycle],
  );

  const sortedTransactions = useMemo(
    () => [...cycleExp].sort((a, b) => b.date.localeCompare(a.date)),
    [cycleExp],
  );

  // Spend calculations for the selected cycle
  const myExp = useMemo(
    () => cycleExp.filter((e) => e.payeeType === "me"),
    [cycleExp],
  );

  const mySpent = useMemo(
    () => myExp.reduce((s, e) => s + e.amount, 0),
    [myExp],
  );

  const owedMap = useMemo(() => {
    const m: Record<string, number> = {};
    cycleExp
      .filter((e) => e.payeeType === "third-party" && e.payeeId)
      .forEach((e) => {
        m[e.payeeId!] = (m[e.payeeId!] || 0) + e.amount;
      });
    return m;
  }, [cycleExp]);

  const thirdPartyList = useMemo(
    () =>
      Object.entries(owedMap)
        .map(([id, amt]) => ({
          person: people.find((p) => p.id === id)!,
          amount: amt,
        }))
        .filter((x) => x.person),
    [owedMap, people],
  );

  const totalOwed = thirdPartyList.reduce((s, x) => s + x.amount, 0);
  const totalSpent = mySpent + totalOwed;

  // Donut chart data for MY expenses in this cycle
  const chartData = useMemo(() => {
    const byCat: Partial<Record<string, number>> = {};
    myExp.forEach((e) => {
      byCat[e.category] = (byCat[e.category] || 0) + e.amount;
    });
    return CATEGORIES.filter((c) => byCat[c]).map((c) => ({
      name: c,
      label: CATEGORY_LABELS[c],
      value: byCat[c]!,
      color: CATEGORY_META[c].color,
    }));
  }, [myExp]);

  return (
    <div className="flex flex-col gap-5 pb-6">
      {/* Header with Cycle Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:px-5 rounded-2xl border border-[#EDEEF5]">
        <div>
          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-[#9BA3AF]">
            <Calendar size={12} className="text-[#6B5FD8]" />
            Ciclo de Faturamento
          </div>
          <p className="text-base font-bold text-[#1A1E2D] mt-0.5">
            {currentCycle.label}
          </p>
        </div>

        {/* Cycle Dropdown Selector */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="w-full sm:w-auto flex items-center justify-between gap-2.5 px-3.5 py-2 rounded-xl bg-[#F4F5F8] border border-[#E8E9F2] text-xs font-semibold text-[#1A1E2D] hover:bg-[#EAECEF] hover:border-[#6B5FD8]/30 transition-all"
          >
            <span className="truncate max-w-[210px]">
              {currentCycle.displayName}
            </span>
            <ChevronDown
              size={14}
              className="text-[#9BA3AF] shrink-0 transition-transform duration-200"
              style={{ transform: dropdownOpen ? "rotate(180deg)" : "none" }}
            />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-full sm:w-72 bg-white rounded-xl shadow-xl border border-[#E8E9F2] overflow-hidden z-30 max-h-64 overflow-y-auto">
              <div className="px-3 py-2 bg-[#FAFAFC] border-b border-[#EDEEF5] text-[10px] font-bold uppercase tracking-wider text-[#9BA3AF]">
                Selecionar Ciclo
              </div>
              <div className="divide-y divide-[#F4F5F8]">
                {cycleOptions.map((opt) => (
                  <button
                    key={opt.offset}
                    type="button"
                    onClick={() => {
                      setSelectedOffset(opt.offset);
                      setDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs text-left transition-colors ${
                      opt.offset === selectedOffset
                        ? "bg-[#EDEBFC] font-bold text-[#6B5FD8]"
                        : "hover:bg-[#F4F5F8] text-[#1A1E2D]"
                    }`}
                  >
                    <div>
                      <p className="font-semibold">{opt.displayName}</p>
                    </div>
                    {opt.offset === selectedOffset && (
                      <Check size={14} className="text-[#6B5FD8] shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-2xl border border-[#EDEEF5] overflow-hidden">
        <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-[#F4F5F8]">
          <p className="text-xs font-bold text-[#1A1E2D] uppercase tracking-wider">
            Transações do Ciclo
          </p>
          <span className="text-[11px] text-[#7B7F94] bg-[#F4F5F8] px-2.5 py-0.5 rounded-full font-medium">
            {sortedTransactions.length}{" "}
            {sortedTransactions.length === 1 ? "registro" : "registros"}
          </span>
        </div>

        {sortedTransactions.length > 0 ? (
          <div className="divide-y divide-[#F4F5F8]">
            {sortedTransactions.map((exp) => {
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
                  className="flex items-center gap-3 px-5 py-3 hover:bg-[#FAFAFA] transition-colors group"
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0"
                    style={{ background: meta.bg }}
                  >
                    {meta.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1A1E2D] truncate">
                      {exp.title}
                    </p>
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
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#6B5FD8] hover:bg-[#EDEBFC] transition-colors opacity-70 group-hover:opacity-100"
                    title="Editar transação"
                  >
                    <Pencil size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-10 px-4 text-center">
            <Receipt size={32} className="text-[#C8CADB]" />
            <p className="text-sm font-semibold text-[#1A1E2D]">
              Nenhuma transação neste ciclo
            </p>
            <p className="text-xs text-[#9BA3AF] max-w-xs">
              Não há lançamentos registrados entre {currentCycle.label}.
              Selecione outro ciclo no menu acima.
            </p>
          </div>
        )}
      </div>

      {/* Cycle Summary & Charts Section */}
      <div className="flex flex-col gap-4">
        {/* Hero Cycle Summary Card */}
        <div
          className="relative rounded-2xl overflow-hidden text-white p-5"
          style={{
            background:
              "linear-gradient(145deg, #1A1E2D 0%, #262B3D 60%, #1E2438 100%)",
          }}
        >
          {/* Subtle decorative background shapes */}
          <div
            className="absolute -top-10 -right-10 w-36 h-36 rounded-full opacity-[0.07]"
            style={{ background: "#6B5FD8" }}
          />
          <div
            className="absolute -bottom-10 -left-6 w-28 h-28 rounded-full opacity-[0.05]"
            style={{ background: "#3D9E8C" }}
          />

          <div className="relative">
            <p className="text-white/50 text-[10px] font-semibold uppercase tracking-widest mb-1">
              Resumo do Ciclo Selecionado ({currentCycle.label})
            </p>
            <div className="flex items-baseline gap-2 mb-4">
              <span
                className="text-3xl font-semibold leading-none tracking-tight"
                style={{ fontFamily: "DM Mono, monospace" }}
              >
                {fmtCurrency(totalSpent)}
              </span>
              <span className="text-xs text-white/40">total movimentado</span>
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/[0.1]">
              <div>
                <p className="text-white/40 text-[10px] uppercase font-semibold mb-1">
                  Gastos por mim
                </p>
                <p
                  className="text-white text-base font-bold"
                  style={{ fontFamily: "DM Mono, monospace" }}
                >
                  {fmtCurrency(mySpent, true)}
                </p>
              </div>

              <div>
                <p className="text-white/40 text-[10px] uppercase font-semibold mb-1">
                  Gasto por Terceiros
                </p>
                <p
                  className="text-base font-bold"
                  style={{
                    fontFamily: "DM Mono, monospace",
                    color: totalOwed > 0 ? "#6BAE9E" : "#FFFFFF",
                  }}
                >
                  {fmtCurrency(totalOwed, true)}
                </p>
              </div>

              <div>
                <p className="text-white/40 text-[10px] uppercase font-semibold mb-1">
                  Transações
                </p>
                <p
                  className="text-white text-base font-bold"
                  style={{ fontFamily: "DM Mono, monospace" }}
                >
                  {sortedTransactions.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts & Third-Party Breakdown Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Donut Chart: By Category */}
          <div className="bg-white rounded-2xl border border-[#EDEEF5] p-5">
            <p className="text-xs font-semibold text-[#1A1E2D] mb-4">
              Meus Gastos por Categoria
            </p>
            {chartData.length > 0 ? (
              <>
                <div
                  className="relative mx-auto"
                  style={{ width: 148, height: 148 }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={46}
                        outerRadius={66}
                        paddingAngle={3}
                        dataKey="value"
                        startAngle={90}
                        endAngle={-270}
                        strokeWidth={0}
                      >
                        {chartData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} strokeWidth={0} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <DonutCenter spent={mySpent} budget={budget} />
                </div>
                <div className="mt-4 flex flex-col gap-2">
                  {chartData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ background: item.color }}
                      />
                      <span className="text-[12px] text-[#7B7F94] flex-1">
                        {item.label}
                      </span>
                      <span
                        className="text-[12px] font-semibold text-[#1A1E2D]"
                        style={{ fontFamily: "DM Mono, monospace" }}
                      >
                        {fmtCurrency(item.value, true)}
                      </span>
                      <span className="text-[10px] text-[#9BA3AF] w-7 text-right">
                        {mySpent > 0
                          ? ((item.value / mySpent) * 100).toFixed(0)
                          : 0}
                        %
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <Receipt size={24} className="text-[#C8CADB]" />
                <p className="text-xs text-[#9BA3AF]">
                  Nenhum gasto próprio neste ciclo
                </p>
              </div>
            )}
          </div>

          {/* Third-Party Breakdown: Quem te deve no ciclo */}
          <div className="bg-white rounded-2xl border border-[#EDEEF5] p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold text-[#1A1E2D]">
                Terceiros no Ciclo
              </p>
              {totalOwed > 0 && (
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-lg"
                  style={{ background: "#EDEBFC", color: "#6B5FD8" }}
                >
                  {fmtCurrency(totalOwed, true)}
                </span>
              )}
            </div>

            {thirdPartyList.length > 0 ? (
              <div className="flex flex-col gap-3.5">
                {thirdPartyList.map(({ person, amount }) => (
                  <div key={person.id} className="flex items-center gap-3">
                    <Avatar person={person} size={36} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#1A1E2D]">
                        {person.name}
                      </p>
                      <div className="w-full mt-1.5 h-1 rounded-full bg-[#F0F1F7] overflow-hidden">
                        <div
                          className="h-1 rounded-full transition-all duration-700"
                          style={{
                            width: `${(amount / totalOwed) * 100}%`,
                            background: person.color,
                          }}
                        />
                      </div>
                    </div>
                    <span
                      className="text-sm font-bold shrink-0"
                      style={{
                        fontFamily: "DM Mono, monospace",
                        color: person.color,
                      }}
                    >
                      {fmtCurrency(amount)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSharingPerson(person)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-[#7B7F94] hover:text-[#6B5FD8] hover:bg-[#EDEBFC] transition-colors cursor-pointer"
                      title={`Gerar link de auditoria para ${person.name}`}
                    >
                      <Share2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <Users size={24} className="text-[#C8CADB]" />
                <p className="text-xs text-[#9BA3AF]">
                  Nenhum gasto por terceiros neste ciclo
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Expense Modal */}
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

      {/* Share Audit Modal */}
      {sharingPerson && (
        <ShareAuditModal
          person={sharingPerson}
          expenses={expenses}
          closingDay={closingDay}
          initialOffset={selectedOffset}
          onClose={() => setSharingPerson(null)}
        />
      )}
    </div>
  );
}
