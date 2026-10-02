import { useState } from "react";
import { CATEGORIES, CATEGORY_LABELS, CATEGORY_META } from "@/lib/constants";
import { parseInstallmentTitle } from "@/lib/utils";
import type { Expense } from "@/lib/types";
import { CreditCard } from "lucide-react";

interface EditExpenseModalProps {
  expense: Expense;
  onClose: () => void;
  onSave: (updated: Expense) => void;
  onDelete?: (id: string) => void;
}

export function EditExpenseModal({
  expense,
  onClose,
  onSave,
  onDelete,
}: EditExpenseModalProps) {
  const [title, setTitle] = useState(expense.title);
  const [category, setCategory] = useState(expense.category);
  const [amount, setAmount] = useState(expense.amount);
  const [date, setDate] = useState(expense.date);

  const parsed = parseInstallmentTitle(expense.title);
  const isInstallment =
    Boolean(parsed) ||
    Boolean(expense.installmentsCount && expense.installmentsCount > 1) ||
    /\(\d+\/\d+\)/.test(expense.title);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...expense,
      title,
      category,
      amount: Number(amount),
      date,
    });
    onClose();
  };

  const handleDelete = () => {
    const confirmMsg =
      parsed && parsed.installmentNumber < parsed.installmentsCount
        ? `Esta despesa é parcelada (${parsed.installmentNumber}/${parsed.installmentsCount}). Ao excluir, esta parcela e todas as dos meses seguintes também serão excluídas. Deseja continuar?`
        : isInstallment
          ? "Tem certeza que deseja excluir esta despesa e as parcelas dos meses seguintes?"
          : "Tem certeza que deseja excluir esta despesa?";

    const confirm = window.confirm(confirmMsg);
    if (confirm) {
      onDelete?.(expense.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 sm:p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-lg font-bold text-[#1A1E2D]">Editar despesa</p>
              {isInstallment && (
                <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#EDEBFC] text-[#6B5FD8]">
                  <CreditCard size={11} />
                  {parsed
                    ? `Parcela ${parsed.installmentNumber}/${parsed.installmentsCount}`
                    : "Parcelada"}
                </span>
              )}
            </div>
            <p className="text-xs text-[#9BA3AF]">Altere os detalhes do lançamento</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold cursor-pointer p-1"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              Nome
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-gray-200 p-2.5 text-sm outline-none focus:border-[#6B5FD8] focus:ring-2 focus:ring-[#6B5FD820]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              Categoria
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 p-1 rounded-xl border border-gray-200 bg-gray-50/50">
              {CATEGORIES.map((cat) => {
                const m = CATEGORY_META[cat];
                const sel = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-lg transition-all cursor-pointer ${
                      sel ? "shadow-xs" : "hover:bg-gray-100"
                    }`}
                    style={{
                      background: sel ? m.bg : "transparent",
                    }}
                  >
                    <span style={{ fontSize: 18 }}>{m.icon}</span>
                    <span
                      className="text-[10px] font-semibold text-center leading-tight truncate w-full"
                      style={{ color: sel ? m.color : "#6B7280" }}
                    >
                      {CATEGORY_LABELS[cat]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                Valor (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full rounded-xl border border-gray-200 p-2.5 text-sm outline-none focus:border-[#6B5FD8] focus:ring-2 focus:ring-[#6B5FD820]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                Data
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-gray-200 p-2.5 text-sm outline-none focus:border-[#6B5FD8] focus:ring-2 focus:ring-[#6B5FD820]"
                required
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100 gap-2">
            <button
              type="button"
              onClick={handleDelete}
              className="text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-xl transition-colors cursor-pointer"
            >
              Excluir
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-xl bg-[#6B5FD8] px-4 py-2 text-sm font-medium text-white hover:bg-[#5A4EC4] transition-colors cursor-pointer"
              >
                Salvar
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
