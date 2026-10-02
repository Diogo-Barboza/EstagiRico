import type { Person, Expense, Category } from "./types";

export interface AuditExpenseItem {
  id: string;
  title: string;
  amount: number;
  category: Category;
  date: string;
  installmentNumber?: number;
  installmentsCount?: number;
}

export interface AuditStatementPayload {
  v: number; // version
  personId: string;
  personName: string;
  personColor: string;
  cycleLabel: string;
  cycleStartDate: string;
  cycleEndDate: string;
  totalOwed: number;
  createdAt: number;
  expiresAt: number;
  expenses: AuditExpenseItem[];
}

export interface AuditVerificationResult {
  valid: boolean;
  expired?: boolean;
  payload?: AuditStatementPayload;
  error?: string;
}

// 24 hours in milliseconds
export const AUDIT_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * Encodes a string to a safe base64url string with UTF-8 support
 */
function toBase64Url(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * Decodes a base64url string with UTF-8 support
 */
function fromBase64Url(base64Url: string): string {
  let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

/**
 * Generates an expirable 24-hour audit token for a specific person, cycle and expenses.
 */
export function generateAuditToken(
  person: Person,
  cycle: { label: string; startDate: Date; endDate: Date },
  personCycleExpenses: Expense[],
): string {
  const now = Date.now();
  const expiresAt = now + AUDIT_TOKEN_TTL_MS;

  const totalOwed = personCycleExpenses.reduce((s, e) => s + e.amount, 0);

  const payload: AuditStatementPayload = {
    v: 1,
    personId: person.id,
    personName: person.name,
    personColor: person.color,
    cycleLabel: cycle.label,
    cycleStartDate: cycle.startDate.toISOString().split("T")[0],
    cycleEndDate: cycle.endDate.toISOString().split("T")[0],
    totalOwed: Math.round(totalOwed * 100) / 100,
    createdAt: now,
    expiresAt,
    expenses: personCycleExpenses.map((e) => ({
      id: e.id,
      title: e.title,
      amount: e.amount,
      category: e.category,
      date: e.date,
      installmentNumber: e.installmentNumber,
      installmentsCount: e.installmentsCount,
    })),
  };

  return toBase64Url(JSON.stringify(payload));
}

/**
 * Verifies and decodes an audit token, verifying the 24h expiration timestamp.
 */
export function verifyAuditToken(token: string): AuditVerificationResult {
  try {
    const jsonStr = fromBase64Url(token.trim());
    const payload: AuditStatementPayload = JSON.parse(jsonStr);

    if (!payload || typeof payload !== "object") {
      return { valid: false, error: "Estrutura do token inválida." };
    }

    if (!payload.expiresAt || !payload.personName || !Array.isArray(payload.expenses)) {
      return { valid: false, error: "Dados da auditoria corrompidos ou incompletos." };
    }

    const now = Date.now();
    if (now > payload.expiresAt) {
      return {
        valid: false,
        expired: true,
        payload,
        error: "Este link expirou. Links de conferência são válidos por 24 horas por motivos de segurança.",
      };
    }

    return {
      valid: true,
      expired: false,
      payload,
    };
  } catch {
    return {
      valid: false,
      error: "O link informado é inválido ou foi corrompido.",
    };
  }
}

/**
 * Builds the full shareable URL containing the audit token
 */
export function buildShareableAuditUrl(token: string): string {
  const origin = window.location.origin;
  const pathname = window.location.pathname;
  return `${origin}${pathname}?audit=${encodeURIComponent(token)}`;
}
