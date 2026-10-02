import { useState, useMemo } from "react";
import {
  DollarSign,
  Calendar,
  Clock,
  AlertTriangle,
  Receipt,
  Printer,
  Copy,
  Check,
  CreditCard,
  ExternalLink,
} from "lucide-react";
import { verifyAuditToken } from "../../lib/auditToken";
import { fmtCurrency } from "../../lib/utils";
import { CATEGORY_LABELS, CATEGORY_META } from "../../lib/constants";
import type { Category } from "../../lib/types";

interface PublicAuditViewProps {
  token: string;
  onExit?: () => void;
}

export function PublicAuditView({ token, onExit }: PublicAuditViewProps) {
  const [copiedSummary, setCopiedSummary] = useState(false);

  const verification = useMemo(() => {
    return verifyAuditToken(token);
  }, [token]);

  const { valid, expired, payload, error } = verification;

  // Format expiration time
  const expirationFormatted = useMemo(() => {
    if (!payload?.expiresAt) return "";
    const date = new Date(payload.expiresAt);
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [payload?.expiresAt]);

  const hoursRemaining = useMemo(() => {
    if (!payload?.expiresAt) return 0;
    const diff = payload.expiresAt - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60)));
  }, [payload?.expiresAt]);

  // Copy plain text summary for WhatsApp
  const handleCopySummary = () => {
    if (!payload) return;
    const lines = [
      `📊 *Extrato de Gastos — EstagiRico*`,
      `👤 Beneficiário: ${payload.personName}`,
      `📅 Ciclo: ${payload.cycleLabel}`,
      `💰 *Total Devido: ${fmtCurrency(payload.totalOwed)}*`,
      ``,
      `*Detalhamento dos Gastos:*`,
      ...payload.expenses.map((e) => {
        const cat = CATEGORY_LABELS[e.category] || e.category;
        const dateFmt = e.date.split("-").reverse().slice(0, 2).join("/");
        return `• ${dateFmt} — ${e.title} [${cat}]: ${fmtCurrency(e.amount)}`;
      }),
      ``,
      `_Link de auditoria válido por 24h._`,
    ];

    navigator.clipboard.writeText(lines.join("\n"));
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  // ── Cenário: Link Expirado ou Inválido ──
  if (!valid || !payload) {
    return (
      <div
        className="min-h-screen bg-[#F4F5F8] flex items-center justify-center p-4"
        style={{ fontFamily: "DM Sans, system-ui, sans-serif" }}
      >
        <div className="w-full max-w-md bg-white rounded-3xl border border-[#EDEEF5] p-6 sm:p-8 shadow-sm text-center">
          <div
            className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4"
            style={{ background: expired ? "#FFF4E8" : "#FCEAEA" }}
          >
            {expired ? (
              <Clock size={32} style={{ color: "#E8924A" }} />
            ) : (
              <AlertTriangle size={32} style={{ color: "#D85F5F" }} />
            )}
          </div>

          <h1 className="text-xl font-bold text-[#1A1E2D] mb-2">
            {expired ? "Link de Auditoria Expirado" : "Link Inválido"}
          </h1>

          <p className="text-sm text-[#7B7F94] mb-6 leading-relaxed">
            {error ||
              "Este link de consulta expirou após 24 horas por razões de privacidade e integridade financeira."}
          </p>

          {payload && (
            <div className="p-4 rounded-2xl bg-[#FAFAFC] border border-[#EDEEF5] text-left text-xs text-[#7B7F94] mb-6 space-y-1.5">
              <p>
                <strong className="text-[#1A1E2D]">Beneficiário:</strong>{" "}
                {payload.personName}
              </p>
              <p>
                <strong className="text-[#1A1E2D]">Ciclo:</strong>{" "}
                {payload.cycleLabel}
              </p>
              <p>
                <strong className="text-[#1A1E2D]">Expirou em:</strong>{" "}
                {expirationFormatted}
              </p>
            </div>
          )}

          <p className="text-xs text-[#9BA3AF] mb-6">
            Caso precise auditar estas despesas, solicite um novo link atualizado
            ao titular da conta.
          </p>

          {onExit && (
            <button
              onClick={onExit}
              className="w-full py-3 rounded-xl bg-[#6B5FD8] text-white text-sm font-bold hover:bg-[#5A4FC8] transition-colors"
            >
              Ir para o EstagiRico
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── Cenário: Link Válido (< 24h) ──
  return (
    <div
      className="min-h-screen bg-[#F4F5F8] text-[#1A1E2D] pb-12 print:bg-white print:pb-0"
      style={{ fontFamily: "DM Sans, system-ui, sans-serif" }}
    >
      {/* Top Brand Bar */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-[#EDEEF5] sticky top-0 z-30 px-4 sm:px-8 py-3.5 print:hidden">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shadow-xs"
              style={{
                background: "linear-gradient(145deg, #7B6FE0, #5A4FC8)",
              }}
            >
              <DollarSign size={16} color="white" strokeWidth={2.5} />
            </div>
            <div>
              <span className="text-sm font-bold text-[#1A1E2D] block leading-none">
                EstagiRico
              </span>
              <span className="text-[10px] text-[#9BA3AF] font-medium">
                Auditoria de Gastos
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#EDEBFC] text-[#6B5FD8]">
              <Clock size={12} />
              Válido por {hoursRemaining}h
            </span>
            {onExit && (
              <button
                onClick={onExit}
                className="text-xs font-semibold text-[#7B7F94] hover:text-[#1A1E2D] px-2.5 py-1 rounded-lg hover:bg-[#F4F5F8] transition-colors"
                title="Fechar e ir para o app"
              >
                Voltar ao App
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-2xl mx-auto px-4 pt-6 space-y-4">
        {/* Person & Cycle Information Banner */}
        <div className="bg-white rounded-3xl border border-[#EDEEF5] p-5 sm:p-6 shadow-xs">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0"
                style={{ background: payload.personColor || "#6B5FD8" }}
              >
                {payload.personName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#9BA3AF]">
                  Extrato de Prestação de Contas
                </p>
                <h1 className="text-xl sm:text-2xl font-bold text-[#1A1E2D]">
                  {payload.personName}
                </h1>
              </div>
            </div>

            <div className="text-right hidden sm:block">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-[#9BA3AF] block mb-1">
                Fatura do Ciclo
              </span>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#F4F5F8] text-xs font-bold text-[#1A1E2D]">
                <Calendar size={13} className="text-[#6B5FD8]" />
                {payload.cycleLabel}
              </div>
            </div>
          </div>

          <div className="sm:hidden mt-3 pt-3 border-t border-[#EDEEF5] flex items-center justify-between text-xs">
            <span className="text-[#7B7F94]">Ciclo selecionado:</span>
            <span className="font-bold text-[#1A1E2D]">{payload.cycleLabel}</span>
          </div>
        </div>

        {/* Hero Card: Total Owed (No topo, antes da tabela) */}
        <div
          className="relative rounded-3xl overflow-hidden text-white p-6 sm:p-7 shadow-sm"
          style={{
            background:
              "linear-gradient(145deg, #1A1E2D 0%, #262B3D 60%, #1E2438 100%)",
          }}
        >
          {/* Decorative shapes */}
          <div
            className="absolute -top-12 -right-12 w-36 h-36 rounded-full opacity-[0.08]"
            style={{ background: "#6B5FD8" }}
          />
          <div
            className="absolute -bottom-10 -left-6 w-28 h-28 rounded-full opacity-[0.06]"
            style={{ background: "#3D9E8C" }}
          />

          <div className="relative">
            <p className="text-white/60 text-[11px] font-semibold uppercase tracking-widest mb-1.5">
              Valor Total Devido no Ciclo
            </p>
            <div className="flex items-baseline gap-2 mb-2">
              <span
                className="text-3xl sm:text-4xl font-bold tracking-tight text-white"
                style={{ fontFamily: "DM Mono, monospace" }}
              >
                {fmtCurrency(payload.totalOwed)}
              </span>
            </div>
            <p className="text-xs text-white/50">
              Soma referente a {payload.expenses.length} lançamento
              {payload.expenses.length !== 1 ? "s" : ""} no período
            </p>
          </div>
        </div>

        {/* Table / List of Expenses (Abaixo do total) */}
        <div className="bg-white rounded-3xl border border-[#EDEEF5] overflow-hidden shadow-xs">
          <div className="px-5 py-4 border-b border-[#EDEEF5] flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#1A1E2D]">
                Discriminação dos Gastos
              </h2>
              <p className="text-xs text-[#9BA3AF]">
                Itens computados nesta fatura
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#F4F5F8] text-[#7B7F94]">
              {payload.expenses.length} item
              {payload.expenses.length !== 1 ? "s" : ""}
            </span>
          </div>

          {payload.expenses.length > 0 ? (
            <div className="divide-y divide-[#F4F5F8]">
              {payload.expenses.map((exp) => {
                const meta = CATEGORY_META[exp.category as Category] || {
                  color: "#6B7280",
                  icon: "📦",
                  bg: "#F3F4F6",
                };
                const label =
                  CATEGORY_LABELS[exp.category as Category] || exp.category;
                const formattedDate = exp.date
                  ? new Date(exp.date + "T12:00:00").toLocaleDateString(
                      "pt-BR",
                      {
                        day: "2-digit",
                        month: "short",
                      },
                    )
                  : "";

                const isInstallment =
                  (exp.installmentsCount && exp.installmentsCount > 1) ||
                  /\(\d+\/\d+\)/.test(exp.title);

                return (
                  <div
                    key={exp.id}
                    className="p-4 sm:p-5 flex items-center gap-3.5 hover:bg-[#FAFAFC] transition-colors"
                  >
                    {/* Category Icon */}
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 text-base"
                      style={{ background: meta.bg }}
                    >
                      {meta.icon}
                    </div>

                    {/* Expense details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-[#1A1E2D] truncate">
                          {exp.title}
                        </p>
                        {isInstallment && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#EDEBFC] text-[#6B5FD8]">
                            <CreditCard size={10} />
                            Parcelada
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#9BA3AF] mt-0.5">
                        <span>{formattedDate}</span>
                        <span>·</span>
                        <span
                          className="font-medium"
                          style={{ color: meta.color }}
                        >
                          {label}
                        </span>
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="text-right shrink-0">
                      <p
                        className="text-sm sm:text-base font-bold text-[#1A1E2D]"
                        style={{ fontFamily: "DM Mono, monospace" }}
                      >
                        {fmtCurrency(exp.amount)}
                      </p>
                    </div>
                  </div>
                );
              })}

              {/* Total Footer Row */}
              <div className="p-4 sm:p-5 bg-[#FAFAFC] flex items-center justify-between border-t border-[#EDEEF5]">
                <span className="text-xs font-bold uppercase tracking-wider text-[#7B7F94]">
                  Total a pagar
                </span>
                <span
                  className="text-base sm:text-lg font-bold text-[#1A1E2D]"
                  style={{ fontFamily: "DM Mono, monospace" }}
                >
                  {fmtCurrency(payload.totalOwed)}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-10 text-center flex flex-col items-center gap-2">
              <Receipt size={32} className="text-[#C8CADB]" />
              <p className="text-sm font-semibold text-[#1A1E2D]">
                Nenhum gasto registrado
              </p>
              <p className="text-xs text-[#9BA3AF]">
                Não há despesas vinculadas a este ciclo.
              </p>
            </div>
          )}
        </div>

        {/* Security & Expiration Disclaimer */}
        <div className="bg-white rounded-2xl border border-[#EDEEF5] p-4 text-xs text-[#7B7F94] flex items-start gap-3">
          <Clock size={16} className="text-[#6B5FD8] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-[#1A1E2D]">
              Link com expiração automática (24 horas)
            </p>
            <p className="text-[#9BA3AF] leading-relaxed">
              Este extrato foi gerado para simples conferência e auditoria. Por
              motivos de segurança, este link perderá a validade em{" "}
              <strong>{expirationFormatted}</strong>.
            </p>
          </div>
        </div>

        {/* Action Buttons for User Convenience */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2 print:hidden">
          <button
            onClick={handleCopySummary}
            className="flex-1 py-3 px-4 rounded-xl border border-[#E8E9F2] bg-white hover:bg-[#F4F5F8] text-xs font-bold text-[#1A1E2D] flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-xs cursor-pointer"
          >
            {copiedSummary ? (
              <>
                <Check size={14} className="text-[#3D9E6E]" />
                <span className="text-[#3D9E6E]">Copiado para o WhatsApp!</span>
              </>
            ) : (
              <>
                <Copy size={14} className="text-[#6B5FD8]" />
                Copiar Resumo em Texto
              </>
            )}
          </button>

          <button
            onClick={() => window.print()}
            className="flex-1 py-3 px-4 rounded-xl border border-[#E8E9F2] bg-white hover:bg-[#F4F5F8] text-xs font-bold text-[#1A1E2D] flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-xs cursor-pointer"
          >
            <Printer size={14} className="text-[#7B7F94]" />
            Imprimir / Salvar PDF
          </button>
        </div>
      </main>
    </div>
  );
}
