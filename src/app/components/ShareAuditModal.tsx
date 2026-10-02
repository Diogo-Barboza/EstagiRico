import { useState, useMemo } from "react";
import {
  X,
  Share2,
  Copy,
  Check,
  Calendar,
  ExternalLink,
  Clock,
  Wallet,
  Receipt,
} from "lucide-react";
import type { Person, Expense } from "../../lib/types";
import {
  getCycleOptions,
  isInCycle,
  fmtCurrency,
} from "../../lib/utils";
import {
  generateAuditToken,
  buildShareableAuditUrl,
} from "../../lib/auditToken";
import { Avatar } from "./Avatar";

interface ShareAuditModalProps {
  person: Person | null;
  expenses: Expense[];
  closingDay: number;
  initialOffset?: number;
  onClose: () => void;
}

export function ShareAuditModal({
  person,
  expenses,
  closingDay,
  initialOffset = 0,
  onClose,
}: ShareAuditModalProps) {
  const [selectedOffset, setSelectedOffset] = useState<number>(initialOffset);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Available cycle options: 12 past cycles + current + next
  const cycleOptions = useMemo(
    () => getCycleOptions(closingDay, 12, 1),
    [closingDay],
  );

  const selectedCycle = useMemo(
    () =>
      cycleOptions.find((c) => c.offset === selectedOffset) || cycleOptions[0],
    [cycleOptions, selectedOffset],
  );

  // Expenses of this person in the selected cycle
  const personCycleExpenses = useMemo(() => {
    if (!person) return [];
    return expenses.filter(
      (e) =>
        e.payeeId === person.id &&
        isInCycle(e.date, selectedCycle.startDate, selectedCycle.endDate),
    );
  }, [expenses, person, selectedCycle]);

  const totalOwed = useMemo(
    () => personCycleExpenses.reduce((s, e) => s + e.amount, 0),
    [personCycleExpenses],
  );

  if (!person) return null;

  const handleGenerateLink = () => {
    const token = generateAuditToken(
      person,
      selectedCycle,
      personCycleExpenses,
    );
    const url = buildShareableAuditUrl(token);
    setGeneratedUrl(url);

    // Auto copy to clipboard
    navigator.clipboard.writeText(url).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleCopyExistingLink = () => {
    if (!generatedUrl) return;
    navigator.clipboard.writeText(generatedUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-5 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[#EDEEF5]">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "#EDEBFC", color: "#6B5FD8" }}
            >
              <Share2 size={17} />
            </div>
            <div>
              <p className="text-base font-bold text-[#1A1E2D]">
                Gerar Link de Auditoria
              </p>
              <p className="text-xs text-[#9BA3AF]">
                Extrato com validade de 24 horas
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-[#9BA3AF] hover:text-[#1A1E2D] hover:bg-[#F4F5F8] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Selected Person Card */}
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#FAFAFC] border border-[#EDEEF5]">
          <Avatar person={person} size={42} />
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9BA3AF]">
              Beneficiário selecionado
            </span>
            <p className="text-sm font-bold text-[#1A1E2D] truncate">
              {person.name}
            </p>
          </div>
          <span
            className="w-3 h-3 rounded-full shrink-0"
            style={{ background: person.color }}
          />
        </div>

        {/* Cycle Selector */}
        <div>
          <label className="text-[10px] font-semibold uppercase tracking-widest text-[#9BA3AF] block mb-1.5">
            Selecione o Ciclo de Faturamento
          </label>
          <div className="relative">
            <select
              value={selectedOffset}
              onChange={(e) => {
                setSelectedOffset(Number(e.target.value));
                setGeneratedUrl(null); // Reset generated link on cycle change
              }}
              className="w-full appearance-none px-4 py-3 rounded-xl bg-[#F4F5F8] border border-transparent hover:border-[#E8E9F2] focus:border-[#6B5FD8] text-xs font-semibold text-[#1A1E2D] outline-none transition-all cursor-pointer"
            >
              {cycleOptions.map((opt) => (
                <option key={opt.offset} value={opt.offset}>
                  {opt.displayName}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#9BA3AF]">
              <Calendar size={14} />
            </div>
          </div>
        </div>

        {/* Cycle Summary Preview */}
        <div className="p-4 rounded-2xl bg-[#F4F5F8] border border-[#EDEEF5] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "#EDEBFC" }}
            >
              <Wallet size={18} style={{ color: "#6B5FD8" }} />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#9BA3AF]">
                Total no ciclo ({selectedCycle.label})
              </p>
              <p
                className="text-lg font-bold"
                style={{
                  fontFamily: "DM Mono, monospace",
                  color: totalOwed > 0 ? person.color : "#1A1E2D",
                }}
              >
                {fmtCurrency(totalOwed)}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-white border border-[#E8E9F2] text-[#7B7F94]">
              {personCycleExpenses.length} despesa
              {personCycleExpenses.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Security / Expiration Note */}
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FFF8E6] border border-[#F3DE97] text-[11px] text-[#8C6B1F]">
          <Clock size={14} className="shrink-0 mt-0.5" />
          <p>
            O link gerado permite que <strong>{person.name}</strong> confira
            apenas suas próprias despesas deste ciclo sem precisar de login. Ele
            expirará automaticamente em <strong>24 horas</strong>.
          </p>
        </div>

        {/* Link Generation Result */}
        {generatedUrl ? (
          <div className="space-y-3 pt-1">
            <div className="p-3 rounded-xl bg-[#EDEBFC] border border-[#6B5FD8]/25 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#6B5FD8] flex items-center gap-1.5">
                  <Check size={13} className="text-[#3D9E6E]" />
                  Link gerado com sucesso!
                </span>
                <span className="text-[10px] font-semibold text-[#6B5FD8]/70">
                  Válido por 24h
                </span>
              </div>
              <input
                type="text"
                readOnly
                value={generatedUrl}
                className="w-full text-xs bg-white px-3 py-2 rounded-lg border border-[#D5D0F8] text-[#1A1E2D] font-mono select-all outline-none"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCopyExistingLink}
                className="flex-1 py-3 px-4 rounded-xl bg-[#6B5FD8] hover:bg-[#5A4FC8] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-xs cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check size={14} />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    Copiar Link Novamente
                  </>
                )}
              </button>

              <a
                href={generatedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-4 rounded-xl border border-[#E8E9F2] bg-white hover:bg-[#F4F5F8] text-xs font-bold text-[#1A1E2D] flex items-center justify-center gap-1.5 transition-colors"
                title="Abrir extrato em nova aba"
              >
                <ExternalLink size={14} />
                Visualizar
              </a>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleGenerateLink}
            className="w-full py-3.5 rounded-xl bg-[#6B5FD8] hover:bg-[#5A4FC8] text-white text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-md shadow-[#6B5FD830] cursor-pointer"
          >
            <Share2 size={16} />
            Gerar Link Expirável (24h)
          </button>
        )}
      </div>
    </div>
  );
}
