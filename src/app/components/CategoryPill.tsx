import { CATEGORY_META, CATEGORY_LABELS } from "../../lib/constants";
import type { Category } from "../../lib/types";

export function CategoryPill({ category }: { category: Category }) {
  const m = CATEGORY_META[category];
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium leading-none"
      style={{ background: m.bg, color: m.color }}
    >
      <span style={{ fontSize: 10 }}>{m.icon}</span>
      {CATEGORY_LABELS[category]}
    </span>
  );
}
