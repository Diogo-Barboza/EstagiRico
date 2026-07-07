import { useState, useMemo } from "react";
import { Plus, X, Wallet, Trash2, Loader2 } from "lucide-react";
import { PERSON_COLORS } from "../../lib/constants";
import { getCurrentCycleDates, isInCycle, fmtCurrency } from "../../lib/utils";
import type { Person, Expense } from "../../lib/types";
import { Avatar } from "./Avatar";

interface PeopleViewProps {
  people: Person[];
  expenses: Expense[];
  closingDay: number;
  onAdd: (n: string, c: string) => void;
  onDelete: (id: string) => void;
  addingPerson: boolean;
}

export function PeopleView({
  people,
  expenses,
  closingDay,
  onAdd,
  onDelete,
  addingPerson,
}: PeopleViewProps) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState(PERSON_COLORS[0]);

  const cycle = useMemo(() => getCurrentCycleDates(closingDay), [closingDay]);
  const cycleExp = useMemo(
    () =>
      expenses.filter((e) => isInCycle(e.date, cycle.startDate, cycle.endDate)),
    [expenses, cycle],
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

  const totalOwed = Object.values(owedMap).reduce((s, v) => s + v, 0);

  function submit() {
    if (!name.trim() || addingPerson) return;
    onAdd(name.trim(), color);
    setName("");
    setColor(PERSON_COLORS[0]);
    setShowForm(false);
  }

  return (
    <div className="flex flex-col gap-4 pb-4">
      <div className="flex items-center justify-between pt-1">
        <div>
          <h2 className="text-base font-bold text-[#1A1E2D]">Pessoas</h2>
          <p className="text-xs text-[#9BA3AF]">
            Gerencie despesas compartilhadas
          </p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white transition-all active:scale-95"
          style={{ background: "#6B5FD8", boxShadow: "0 2px 12px #6B5FD840" }}
        >
          {showForm ? <X size={13} /> : <Plus size={13} />}
          {showForm ? "Cancelar" : "Adicionar"}
        </button>
      </div>

      {/* Totals summary */}
      {people.length > 0 && totalOwed > 0 && (
        <div className="bg-white rounded-2xl border border-[#EDEEF5] px-5 py-4 flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "#EDEBFC" }}
          >
            <Wallet size={18} style={{ color: "#6B5FD8" }} />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#9BA3AF]">
              Total devido neste ciclo
            </p>
            <p
              className="text-lg font-bold text-[#6B5FD8]"
              style={{ fontFamily: "DM Mono, monospace" }}
            >
              {fmtCurrency(totalOwed)}
            </p>
          </div>
        </div>
      )}

      {/* Add form */}
      {showForm && (
        <div className="bg-white rounded-2xl border-2 border-[#6B5FD8]/25 p-5 flex flex-col gap-4">
          <p className="text-sm font-bold text-[#1A1E2D]">Nova Pessoa</p>
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-widest text-[#9BA3AF] block mb-2">
              Nome
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite o nome…"
              onKeyDown={(e) => e.key === "Enter" && submit()}
              autoFocus
              className="w-full px-4 py-3 rounded-xl bg-[#F4F5F8] text-sm text-[#1A1E2D] placeholder:text-[#C8CADB] outline-none focus:ring-2 focus:ring-[#6B5FD820] transition-all"
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-widest text-[#9BA3AF] block mb-2.5">
              Cor
            </label>
            <div className="flex gap-2 flex-wrap">
              {PERSON_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-8 h-8 rounded-full border-[3px] transition-all duration-150"
                  style={{
                    background: c,
                    borderColor: color === c ? "#1A1E2D" : "transparent",
                    transform: color === c ? "scale(1.18)" : "scale(1)",
                  }}
                />
              ))}
            </div>
          </div>
          {name && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F4F5F8]">
              <Avatar person={{ id: "preview", name, color }} size={38} />
              <div>
                <p className="text-sm font-semibold text-[#1A1E2D]">{name}</p>
                <p className="text-xs text-[#9BA3AF]">Pré-visualização</p>
              </div>
            </div>
          )}
          <button
            onClick={submit}
            disabled={!name.trim() || addingPerson}
            className="w-full py-3 rounded-xl text-white text-sm font-bold disabled:opacity-40 transition-all flex items-center justify-center gap-2"
            style={{ background: "#6B5FD8" }}
          >
            {addingPerson && <Loader2 size={16} className="animate-spin" />}
            Adicionar {name || "Pessoa"}
          </button>
        </div>
      )}

      {/* List */}
      {people.length === 0 && !showForm ? (
        <div className="bg-white rounded-2xl border border-[#EDEEF5] flex flex-col items-center gap-3 py-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#F4F5F8] flex items-center justify-center text-2xl">
            👥
          </div>
          <p className="text-sm font-semibold text-[#1A1E2D]">
            Nenhuma pessoa cadastrada
          </p>
          <p className="text-xs text-[#9BA3AF] max-w-[220px]">
            Adicione amigos ou familiares para acompanhar despesas feitas em
            nome deles
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {people.map((person) => {
            const owed = owedMap[person.id] || 0;
            const count = cycleExp.filter(
              (e) => e.payeeId === person.id,
            ).length;
            return (
              <div
                key={person.id}
                className="bg-white rounded-2xl border border-[#EDEEF5] p-4 flex items-center gap-3 group"
              >
                <Avatar person={person} size={44} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#1A1E2D]">
                    {person.name}
                  </p>
                  <p className="text-xs text-[#9BA3AF] mt-0.5">
                    {count > 0
                      ? `${count} despesa${count !== 1 ? "s" : ""} neste ciclo`
                      : "Nenhuma despesa neste ciclo"}
                  </p>
                </div>
                <div className="text-right mr-1">
                  {owed > 0 ? (
                    <>
                      <p
                        className="text-sm font-bold"
                        style={{
                          fontFamily: "DM Mono, monospace",
                          color: person.color,
                        }}
                      >
                        {fmtCurrency(owed)}
                      </p>
                      <p
                        className="text-[10px] font-medium"
                        style={{ color: person.color + "99" }}
                      >
                        te deve
                      </p>
                    </>
                  ) : (
                    <p className="text-xs text-[#9BA3AF]">Quitado ✓</p>
                  )}
                </div>
                <button
                  onClick={() => onDelete(person.id)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[#C8CADB] hover:text-[#D85F5F] hover:bg-[#FCEAEA] transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
