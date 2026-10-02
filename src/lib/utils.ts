import type { Expense } from "./types";

/**
 * Calculates the current billing cycle dates.
 *
 * Logic: if today <= closingDay, the cycle runs from (closingDay+1) of the
 * previous month through closingDay of this month. If today > closingDay,
 * the cycle runs from (closingDay+1) of this month through closingDay of
 * the next month.
 *
 * Example: closing_day=25, today=Jul 7 → d(7) <= 25
 *   cycleStart = Jun 26, cycleEnd = Jul 25
 */
export function getCurrentCycleDates(
  closingDay: number,
  referenceDate: Date = new Date(),
) {
  const d = referenceDate.getDate(),
    m = referenceDate.getMonth(),
    y = referenceDate.getFullYear();

  let cycleStart: Date, cycleEnd: Date;
  if (d <= closingDay) {
    const pm = m === 0 ? 11 : m - 1;
    const py = m === 0 ? y - 1 : y;
    cycleStart = new Date(py, pm, closingDay + 1);
    cycleEnd = new Date(y, m, closingDay);
  } else {
    cycleStart = new Date(y, m, closingDay + 1);
    const nm = m === 11 ? 0 : m + 1;
    const ny = m === 11 ? y + 1 : y;
    cycleEnd = new Date(ny, nm, closingDay);
  }

  const fmt = (dt: Date) =>
    dt.toLocaleDateString("pt-BR", { day: "numeric", month: "short" });

  const daysTotal =
    Math.round((cycleEnd.getTime() - cycleStart.getTime()) / 86400000) + 1;

  const daysElapsed = Math.max(
    0,
    Math.round(
      (referenceDate.getTime() - cycleStart.getTime()) / 86400000,
    ) + 1,
  );

  const daysLeft = Math.max(
    0,
    Math.round((cycleEnd.getTime() - referenceDate.getTime()) / 86400000),
  );

  return {
    startDate: cycleStart,
    endDate: cycleEnd,
    label: `${fmt(cycleStart)} – ${fmt(cycleEnd)}`,
    daysTotal,
    daysElapsed,
    daysLeft,
  };
}

export function fmtCurrency(n: number, compact = false) {
  if (compact && n >= 1000) return "R$" + (n / 1000).toFixed(1) + "k";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(n);
}

export function isInCycle(dateStr: string, start: Date, end: Date) {
  const d = new Date(dateStr + "T12:00:00");
  return d >= start && d <= end;
}

export function getInitial(name: string) {
  return name.charAt(0).toUpperCase();
}

export interface CycleInfo {
  startDate: Date;
  endDate: Date;
  label: string;
  daysTotal: number;
  daysElapsed: number;
  daysLeft: number;
  offset: number;
  displayName: string;
}

export function getCycleByOffset(
  closingDay: number,
  offsetMonths: number = 0,
  referenceDate: Date = new Date(),
): CycleInfo {
  const ref = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth() + offsetMonths,
    Math.min(referenceDate.getDate(), 28),
  );
  const cycle = getCurrentCycleDates(closingDay, ref);

  let displayName = cycle.label;
  if (offsetMonths === 0) {
    displayName = `Ciclo Atual (${cycle.label})`;
  } else if (offsetMonths === -1) {
    displayName = `Ciclo Passado (${cycle.label})`;
  } else if (offsetMonths < -1) {
    displayName = `${Math.abs(offsetMonths)} ciclos atrás (${cycle.label})`;
  } else if (offsetMonths === 1) {
    displayName = `Próximo Ciclo (${cycle.label})`;
  } else {
    displayName = `Em +${offsetMonths} ciclos (${cycle.label})`;
  }

  return {
    ...cycle,
    offset: offsetMonths,
    displayName,
  };
}

export function getCycleOptions(
  closingDay: number,
  pastCount: number = 6,
  futureCount: number = 0,
): CycleInfo[] {
  const options: CycleInfo[] = [];
  for (let i = futureCount; i >= -pastCount; i--) {
    options.push(getCycleByOffset(closingDay, i));
  }
  return options;
}

export function addMonthsToDate(dateStr: string, months: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  if (!y || !m || !d) return dateStr;

  const targetYear = y + Math.floor((m - 1 + months) / 12);
  const targetMonth = (((m - 1 + months) % 12) + 12) % 12 + 1;

  const maxDay = new Date(targetYear, targetMonth, 0).getDate();
  const targetDay = Math.min(d, maxDay);

  const pad = (n: number) => String(n).padStart(2, "0");
  return `${targetYear}-${pad(targetMonth)}-${pad(targetDay)}`;
}

export interface ParsedInstallmentTitle {
  baseTitle: string;
  installmentNumber: number;
  installmentsCount: number;
}

export function parseInstallmentTitle(
  title: string,
): ParsedInstallmentTitle | null {
  const match = title.match(/^(.*?)\s*\((\d+)\/(\d+)\)$/);
  if (!match) return null;
  return {
    baseTitle: match[1].trim(),
    installmentNumber: parseInt(match[2], 10),
    installmentsCount: parseInt(match[3], 10),
  };
}

/**
 * Given a target installment expense and all expenses, finds all expense IDs
 * corresponding to this installment and the ones from following months.
 */
export function getRelatedFollowingInstallmentIds(
  targetExpense: Expense,
  allExpenses: Expense[],
): string[] {
  const parsedTarget = parseInstallmentTitle(targetExpense.title);
  if (!parsedTarget) {
    return [targetExpense.id];
  }

  const { baseTitle, installmentNumber, installmentsCount } = parsedTarget;

  const matches = allExpenses.filter((e) => {
    // Must belong to the same category and payee
    if (e.category !== targetExpense.category) return false;
    if (e.payeeType !== targetExpense.payeeType) return false;
    if (e.payeeId !== targetExpense.payeeId) return false;

    // Amount check with 0.05 tolerance for cent rounding in installment splits
    if (Math.abs(e.amount - targetExpense.amount) > 0.05) return false;

    const parsed = parseInstallmentTitle(e.title);
    if (!parsed) return false;

    // Must match base title (case-insensitive) and total installment count
    const isSameGroup =
      parsed.baseTitle.toLowerCase() === baseTitle.toLowerCase() &&
      parsed.installmentsCount === installmentsCount;

    if (!isSameGroup) return false;

    // Must be the current installment or subsequent installment (following months)
    return (
      parsed.installmentNumber >= installmentNumber &&
      e.date >= targetExpense.date
    );
  });

  if (matches.length === 0) {
    return [targetExpense.id];
  }

  return matches.map((e) => e.id);
}
