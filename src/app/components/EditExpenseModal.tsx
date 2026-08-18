import { Expense } from "@/lib/types";
import { use, useState } from "react";
import { CATEGORIES, CATEGORY_LABELS, CATEGORY_META } from "@/lib/constants";

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Montamos o objeto atualizado mantendo o ID original
    onSave({
      ...expense,
      title,
      category,
      amount: Number(amount), // garantindo que seja number
    });
    onClose(); // fecha o modal após salvar
  };

  const handleDelete = () => {
    const confirm = window.confirm(
      "Tem certeza que deseja exluir essa despesa?",
    );
    if (confirm) {
      onDelete?.(expense.id);
      onClose();
    }
  };

  return (
    // 1. Container FIXO que cobre a tela toda (Overlay / Backdrop)
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      {/* 2. O Cartão do Modal (Conteúdo centralizado) */}
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between">
          <p className="text-lg font-bold text-[#1A1E2D]">Editar despesa</p>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Formulário com os campos */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              Nome
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-gray-200 p-2.5 text-sm outline-none focus:border-[#7B6FE0]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              Categoria
            </label>

            {/* Grid com 3 colunas no mobile e 6 colunas em telas maiores */}
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

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              Valor (R$)
            </label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full rounded-xl border border-gray-200 p-2.5 text-sm outline-none focus:border-[#7B6FE0]"
              required
            />
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            {/* Ação Destrutiva (Esquerda) */}
            <button
              type="button"
              onClick={handleDelete}
              className="text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-xl transition-colors cursor-pointer"
            >
              Excluir despesa
            </button>

            {/* Ações Primárias (Direita) */}
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
                className="rounded-xl bg-[#7B6FE0] px-4 py-2 text-sm font-medium text-white hover:bg-[#685bc7] cursor-pointer"
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
