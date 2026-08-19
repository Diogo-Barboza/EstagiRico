import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Calendar, Receipt, Users } from "lucide-react";
import { getCurrentCycleDates, isInCycle, fmtCurrency } from "../../lib/utils";
import {
  CATEGORIES,
  CATEGORY_LABELS,
  CATEGORY_META,
} from "../../lib/constants";
import type { Expense, Person, View } from "../../lib/types";
import { Avatar } from "./Avatar";
import { DonutCenter } from "./DonutCenter";

interface DashboardProps {
  expenses: Expense[];
  people: Person[];
  closingDay: number;
  budget: number;
  onNav: (v: View) => void;
}

export function Dashboard({
  expenses,
  people,
  closingDay,
  budget,
  onNav,
}: DashboardProps) {
  const cycle = useMemo(() => getCurrentCycleDates(closingDay), [closingDay]);

  const cycleExp = useMemo(
    () =>
      expenses.filter((e) => isInCycle(e.date, cycle.startDate, cycle.endDate)),
    [expenses, cycle],
  );

  const totalSpent = useMemo(
    () => cycleExp.reduce((s, e) => s + e.amount, 0),
    [cycleExp],
  );

  // Only my own expenses for the donut chart and category breakdown
  const myExp = useMemo(
    () => cycleExp.filter((e) => e.payeeType === "me"),
    [cycleExp],
  );

  const mySpent = useMemo(
    () => myExp.reduce((s, e) => s + e.amount, 0),
    [myExp],
  );

  // Chart data based solely on MY expenses
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
  const pct = Math.min((mySpent / budget) * 100, 100);
  const barColor = pct > 90 ? "#D85F5F" : pct > 70 ? "#E8924A" : "#3D9E8C";

  const recent = [...cycleExp]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);

  return (
    <div className="flex flex-col gap-4 pb-4">
      {/* Cycle label row */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#9BA3AF]">
            Ciclo de Faturamento
          </p>
          <p className="text-sm font-semibold text-[#1A1E2D] mt-0.5">
            {cycle.label}
          </p>
        </div>
        <button
          onClick={() => onNav("settings")}
          className="flex items-center gap-1.5 text-xs font-medium text-[#9BA3AF] bg-white border border-[#E8E9F2] rounded-lg px-2.5 py-1.5 hover:border-[#6B5FD8]/30 hover:text-[#6B5FD8] transition-colors"
        >
          <Calendar size={11} />
          Fecha dia {closingDay}
        </button>
      </div>

      {/* Hero spending card */}
      <div
        className="relative rounded-2xl overflow-hidden text-white"
        style={{
          background:
            "linear-gradient(145deg, #1A1E2D 0%, #262B3D 60%, #1E2438 100%)",
        }}
      >
        {/* Decorative orbs */}
        <div
          className="absolute -top-8 -right-8 w-36 h-36 rounded-full opacity-[0.07]"
          style={{ background: "#6B5FD8" }}
        />
        <div
          className="absolute -bottom-10 -left-6 w-28 h-28 rounded-full opacity-[0.05]"
          style={{ background: "#3D9E8C" }}
        />
        <div
          className="absolute top-1/2 right-16 w-20 h-20 rounded-full opacity-[0.04]"
          style={{ background: "#E8924A", transform: "translateY(-50%)" }}
        />

        <div className="relative px-5 pt-5 pb-4">
          <p className="text-white/50 text-[10px] font-semibold uppercase tracking-widest mb-1">
            Meus Gastos
          </p>
          <div className="flex items-baseline gap-3 mb-0.5">
            <span
              className="text-[38px] font-semibold leading-none tracking-tight"
              style={{ fontFamily: "DM Mono, monospace" }}
            >
              {fmtCurrency(mySpent)}
            </span>
          </div>
          <p className="text-white/40 text-xs mb-4">
            de {fmtCurrency(budget)} de orçamento · {cycle.daysLeft} dias
            restantes
          </p>

          {/* Progress */}
          <div className="w-full h-1.5 rounded-full bg-white/10 mb-2">
            <div
              className="h-1.5 rounded-full transition-all duration-1000"
              style={{ width: `${pct}%`, background: barColor }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-white/35">
            <span>{pct.toFixed(0)}% do orçamento usado</span>
            <span>{fmtCurrency(budget - mySpent)} restante</span>
          </div>

          {/* Stats row */}
          <div className="mt-4 pt-4 border-t border-white/[0.08] grid grid-cols-3 gap-2">
            <div>
              <p className="text-white/40 text-[10px] mb-0.5">Total ciclo</p>
              <p
                className="text-white text-sm font-semibold"
                style={{ fontFamily: "DM Mono, monospace" }}
              >
                {fmtCurrency(totalSpent, true)}
              </p>
            </div>
            {totalOwed > 0 && (
              <div>
                <p className="text-white/40 text-[10px] mb-0.5">Me devem</p>
                <p
                  className="text-sm font-semibold"
                  style={{ fontFamily: "DM Mono, monospace", color: "#6BAE9E" }}
                >
                  {fmtCurrency(totalOwed, true)}
                </p>
              </div>
            )}
            <div>
              <p className="text-white/40 text-[10px] mb-0.5">Transações</p>
              <p
                className="text-white text-sm font-semibold"
                style={{ fontFamily: "DM Mono, monospace" }}
              >
                {cycleExp.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Two-column: Donut + Third-party */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Donut chart — only MY expenses */}
        <div className="bg-white rounded-2xl border border-[#EDEEF5] p-5">
          <p className="text-xs font-semibold text-[#1A1E2D] mb-4">
            Por Categoria
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
                {/* DonutCenter shows only MY spent vs budget */}
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
            <div className="flex flex-col items-center gap-2 py-6 text-center">
              <Receipt size={24} className="text-[#C8CADB]" />
              <p className="text-xs text-[#9BA3AF]">
                Nenhuma despesa neste ciclo
              </p>
            </div>
          )}
        </div>

        {/* Third-party owed */}
        <div className="bg-white rounded-2xl border border-[#EDEEF5] p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold text-[#1A1E2D]">Quem te Deve</p>
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
            <div className="flex flex-col gap-3">
              {thirdPartyList.map(({ person, amount }) => (
                <div key={person.id} className="flex items-center gap-3 group">
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
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-6 text-center">
              <Users size={24} className="text-[#C8CADB]" />
              <p className="text-xs text-[#9BA3AF]">
                Nenhuma despesa de terceiros
              </p>
              <button
                onClick={() => onNav("people")}
                className="text-xs font-semibold"
                style={{ color: "#6B5FD8" }}
              >
                Gerenciar pessoas →
              </button>
            </div>
          )}

          {thirdPartyList.length > 0 && (
            <button
              onClick={() => onNav("people")}
              className="mt-4 w-full py-2 rounded-xl text-xs font-semibold border border-[#EDEEF5] text-[#7B7F94] hover:border-[#6B5FD8]/30 hover:text-[#6B5FD8] transition-colors"
            >
              Gerenciar Pessoas
            </button>
          )}
        </div>
      </div>

      {/* Recent transactions */}
      {recent.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#EDEEF5] overflow-hidden">
          <div className="px-5 pt-5 pb-3 flex items-center justify-between">
            <p className="text-xs font-semibold text-[#1A1E2D]">
              Transações Recentes
            </p>
          </div>
          <div className="divide-y divide-[#F4F5F8]">
            {recent.map((exp) => {
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
                  className="flex items-center gap-3 px-5 py-3 hover:bg-[#FAFAFA] transition-colors"
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
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
