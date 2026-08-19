import { useState } from "react";
import { ArrowLeft, Calendar, AlertCircle, Check, Loader2 } from "lucide-react";
import {
  CATEGORIES,
  CATEGORY_LABELS,
  CATEGORY_META,
} from "../../lib/constants";
import { fmtCurrency } from "../../lib/utils";
import { todayStr } from "../../lib/constants";
import type { Expense, Person, Category, PayeeType } from "../../lib/types";
import { Avatar } from "./Avatar";
import { Dropdown } from "./Dropdown";

interface AddExpenseProps {
  people: Person[];
  onSave: (e: Omit<Expense, "id">) => void;
  onCancel: () => void;
  saving: boolean;
}

export function AddExpense({
  people,
  onSave,
  onCancel,
  saving,
}: AddExpenseProps) {
  const [amount, setAmount] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>("Food");
  const [date, setDate] = useState(todayStr);
  const [payeeType, setPayeeType] = useState<PayeeType>("me");
  const [payeeId, setPayeeId] = useState(people[0]?.id || "");
  const [focused, setFocused] = useState(false);
  const [saved, setSaved] = useState(false);

  const amtNum = parseFloat(amount);
  const isValid =
    !isNaN(amtNum) &&
    amtNum > 0 &&
    (payeeType === "me" || (payeeType === "third-party" && payeeId));
  const meta = CATEGORY_META[category];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || saving) return;
    const finalTitle = title.trim() || CATEGORY_LABELS[category];
    const finalDate = date || todayStr;
    setSaved(true);
    onSave({
      title: finalTitle,
      amount: amtNum,
      category,
      date: finalDate,
      payeeType,
      payeeId: payeeType === "third-party" ? payeeId : undefined,
    });
  }

  return (
    <div className="flex flex-col gap-4 pb-4">
      {/* Header */}
      <div className="flex items-center gap-3 pt-1">
        <button
          onClick={onCancel}
          className="w-9 h-9 rounded-xl bg-white border border-[#E8E9F2] flex items-center justify-center text-[#9BA3AF] hover:text-[#1A1E2D] hover:border-[#C8CADB] transition-colors shrink-0"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h2 className="text-base font-bold text-[#1A1E2D]">
            Registrar Gasto
          </h2>
          <p className="text-xs text-[#9BA3AF]">Adicione uma nova transação</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Amount */}
        <div
          className="bg-white rounded-2xl border-2 transition-all duration-200 overflow-hidden"
          style={{
            borderColor: focused ? "#6B5FD8" : "#EDEEF5",
            boxShadow: focused ? "0 0 0 4px #6B5FD812" : "none",
          }}
        >
          <div className="px-6 pt-5 pb-2 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#9BA3AF] mb-4">
              Valor
            </p>
            <div className="flex items-center justify-center gap-1">
              <span className="text-2xl font-light text-[#C8CADB] mt-1">
                R$
              </span>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="0,00"
                autoFocus
                className="text-5xl font-semibold text-[#1A1E2D] bg-transparent outline-none w-52 text-center placeholder:text-[#D8D9E0] [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                style={{ fontFamily: "DM Mono, monospace" }}
              />
            </div>
          </div>
          {/* Category quick strip */}
          <div className="flex border-t border-[#F4F5F8] mt-2">
            {CATEGORIES.map((cat) => {
              const m = CATEGORY_META[cat];
              const sel = category === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className="flex-1 flex flex-col items-center gap-1 py-2.5 transition-all"
                  style={{ background: sel ? m.bg : "transparent" }}
                >
                  <span style={{ fontSize: 16 }}>{m.icon}</span>
                  <span
                    className="text-[9px] font-semibold"
                    style={{ color: sel ? m.color : "#C8CADB" }}
                  >
                    {CATEGORY_LABELS[cat]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Title + Date */}
        <div className="bg-white rounded-2xl border border-[#EDEEF5] p-5 flex flex-col gap-4">
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-widest text-[#9BA3AF] block mb-2">
              Título{" "}
              <span className="normal-case font-normal text-[#C8CADB]">
                — opcional, padrão: "{CATEGORY_LABELS[category]}"
              </span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={CATEGORY_LABELS[category]}
              className="w-full px-4 py-3 rounded-xl bg-[#F4F5F8] text-sm text-[#1A1E2D] placeholder:text-[#C8CADB] outline-none focus:ring-2 focus:ring-[#6B5FD820] transition-all"
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-widest text-[#9BA3AF] block mb-2">
              Data
            </label>
            <div className="relative">
              <Calendar
                size={14}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9BA3AF] pointer-events-none"
              />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-9 pr-4 py-3 rounded-xl bg-[#F4F5F8] text-sm text-[#1A1E2D] outline-none focus:ring-2 focus:ring-[#6B5FD820] transition-all"
              />
            </div>
          </div>
        </div>

        {/* Payee */}
        <div className="bg-white rounded-2xl border border-[#EDEEF5] p-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#9BA3AF] mb-3">
            Pago por
          </p>
          <div className="flex gap-2 mb-4 p-1 bg-[#F4F5F8] rounded-xl">
            {(["me", "third-party"] as PayeeType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setPayeeType(type)}
                className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
                style={{
                  background: payeeType === type ? "#1A1E2D" : "transparent",
                  color: payeeType === type ? "#FFFFFF" : "#9BA3AF",
                }}
              >
                {type === "me" ? "Eu" : "Terceiro"}
              </button>
            ))}
          </div>

          {payeeType === "third-party" && (
            <div className="flex flex-col gap-2">
              {people.length === 0 ? (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-[#FFF4E8] border border-[#F2A65A]/20">
                  <AlertCircle size={14} style={{ color: "#E8924A" }} />
                  <p className="text-xs text-[#E8924A]">
                    Nenhuma pessoa cadastrada. Vá até a aba{" "}
                    <strong>Pessoas</strong> primeiro.
                  </p>
                </div>
              ) : (
                people.map((person) => (
                  <button
                    key={person.id}
                    type="button"
                    onClick={() => setPayeeId(person.id)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 transition-all"
                    style={{
                      borderColor:
                        payeeId === person.id ? person.color : "transparent",
                      background:
                        payeeId === person.id ? person.color + "12" : "#F4F5F8",
                    }}
                  >
                    <Avatar person={person} size={32} />
                    <span className="text-sm font-semibold text-[#1A1E2D] flex-1 text-left">
                      {person.name}
                    </span>
                    {payeeId === person.id && (
                      <Check size={15} style={{ color: person.color }} />
                    )}
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!isValid || saving}
          className="w-full py-4 rounded-2xl text-white text-sm font-bold transition-all disabled:opacity-40 active:scale-[0.98] flex items-center justify-center gap-2"
          style={{
            background: isValid ? (saved ? "#3D9E8C" : "#6B5FD8") : "#C8CADB",
            boxShadow: isValid ? "0 4px 20px #6B5FD840" : "none",
          }}
        >
          {saving && <Loader2 size={16} className="animate-spin" />}
          {saved && !saving
            ? "✓ Salvo!"
            : `Adicionar ${isValid ? fmtCurrency(amtNum) : ""} Gasto`}
        </button>
      </form>
    </div>
  );
}
