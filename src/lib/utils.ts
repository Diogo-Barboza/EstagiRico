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
