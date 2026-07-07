import { useState, useMemo } from "react";
import { LogOut, Loader2 } from "lucide-react";
import { getCurrentCycleDates } from "../../lib/utils";
import { Dropdown } from "./Dropdown";

interface SettingsViewProps {
  closingDay: number;
  budget: number;
  onClosingDay: (d: number) => void;
  onBudget: (b: number) => void;
  onLogout: () => void;
  updatingProfile: boolean;
}

export function SettingsView({
  closingDay,
  budget,
  onClosingDay,
  onBudget,
  onLogout,
  updatingProfile,
}: SettingsViewProps) {
  const [budgetStr, setBudgetStr] = useState(budget.toString());
  const cycle = useMemo(() => getCurrentCycleDates(closingDay), [closingDay]);
  const days = useMemo(
    () => Array.from({ length: 31 }, (_, i) => String(i + 1)),
    [],
  );

  return (
    <div className="flex flex-col gap-4 pb-4">
      <div className="pt-1">
        <h2 className="text-base font-bold text-[#1A1E2D]">Configurações</h2>
        <p className="text-xs text-[#9BA3AF]">
          Preferências de ciclo e orçamento
        </p>
      </div>

      {/*
        Removed overflow-hidden from this container so the Dropdown list
        is not clipped. The Dropdown now renders its list in a fixed-position
        overlay anyway, but keeping the parent clean helps avoid conflicts.
      */}
      <div className="bg-white rounded-2xl border border-[#EDEEF5]">
        <div className="px-5 pt-5 pb-4 border-b border-[#F4F5F8]">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#9BA3AF] mb-1">
            Dia de Fechamento
          </p>
          <p className="text-xs text-[#7B7F94] mb-3">
            Ciclo atual:{" "}
            <span className="font-semibold text-[#1A1E2D]">{cycle.label}</span>{" "}
            · {cycle.daysLeft} dias restantes
          </p>
          <Dropdown<string>
            value={String(closingDay)}
            options={days}
            onChange={(v) => onClosingDay(parseInt(v))}
            renderOption={(v) => `Dia ${v} do mês`}
          />
        </div>
        <div className="px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#9BA3AF] mb-3">
            Orçamento Mensal
          </p>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#9BA3AF]">
              R$
            </span>
            <input
              type="number"
              value={budgetStr}
              onChange={(e) => setBudgetStr(e.target.value)}
              onBlur={() => {
                const v = parseFloat(budgetStr);
                if (v > 0) onBudget(v);
                else setBudgetStr(budget.toString());
              }}
              className="w-full pl-8 pr-4 py-3 rounded-xl bg-[#F4F5F8] text-sm text-[#1A1E2D] outline-none focus:ring-2 focus:ring-[#6B5FD820] transition-all"
              style={{ fontFamily: "DM Mono, monospace" }}
            />
          </div>
          {updatingProfile && (
            <div className="flex items-center gap-2 mt-2">
              <Loader2 size={12} className="animate-spin text-[#6B5FD8]" />
              <span className="text-[11px] text-[#9BA3AF]">Salvando...</span>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#EDEEF5] p-5">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#9BA3AF] mb-3">
          Sobre
        </p>
        <div className="flex flex-col gap-2.5">
          {[
            ["Ciclo de faturamento", "Ciclo dinâmico personalizável"],
            ["Versão", "1.0.0"],
            ["Moeda", "BRL"],
          ].map(([k, v]) => (
            <div
              key={k}
              className="flex justify-between items-center text-sm border-b border-[#F4F5F8] pb-2.5 last:border-0 last:pb-0"
            >
              <span className="text-[#7B7F94]">{k}</span>
              <span
                className="font-semibold text-[#1A1E2D]"
                style={{
                  fontFamily:
                    k === "Versão" ? "DM Mono, monospace" : undefined,
                }}
              >
                {v}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={onLogout}
        className="w-full py-3.5 rounded-2xl text-sm font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2 border-2 border-[#D85F5F]/20 text-[#D85F5F] hover:bg-[#FCEAEA] hover:border-[#D85F5F]/40"
      >
        <LogOut size={16} />
        Sair
      </button>
    </div>
  );
}
