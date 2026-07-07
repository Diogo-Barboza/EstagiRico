import { fmtCurrency } from "../../lib/utils";

export function DonutCenter({
  spent,
  budget,
}: {
  spent: number;
  budget: number;
}) {
  const pct = Math.min((spent / budget) * 100, 100);
  const color = pct > 90 ? "#D85F5F" : pct > 70 ? "#E8924A" : "#3D9E8C";
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
      <span
        className="text-[9px] font-semibold uppercase tracking-widest"
        style={{ color: "#9BA3AF" }}
      >
        gasto
      </span>
      <span
        className="text-[22px] font-semibold leading-tight"
        style={{ fontFamily: "DM Mono, monospace", color: "#1A1E2D" }}
      >
        {fmtCurrency(spent, true)}
      </span>
      <span className="text-[10px] font-medium" style={{ color }}>
        {pct.toFixed(0)}%
      </span>
    </div>
  );
}
