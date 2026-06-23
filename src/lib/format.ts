export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

const inNumberFormat = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 0,
});

/** Indian-style grouping for amount fields, e.g. 260000 → 2,60,000 */
export function formatNumberWithCommas(value: string | number): string {
  const digits = stripNumberFormatting(String(value));
  if (!digits) return "";
  const num = Number(digits);
  if (Number.isNaN(num)) return "";
  return inNumberFormat.format(num);
}

export function stripNumberFormatting(value: string): string {
  return value.replace(/\D/g, "");
}

/** Format a stored number for an amount input (empty when 0). */
export function formatAmountInputValue(amount: number): string {
  if (!amount || amount <= 0) return "";
  return formatNumberWithCommas(amount);
}

export function parseAmountInput(value: string): number {
  const digits = stripNumberFormatting(value.trim());
  if (!digits) return 0;
  const num = Number(digits);
  if (Number.isNaN(num) || num < 0) return 0;
  return num;
}

/** Compact format for charts: ₹2.1L, ₹50K */
export function formatCompactCurrency(amount: number): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";
  if (abs >= 10000000) {
    return `${sign}₹${(abs / 10000000).toFixed(1)}Cr`;
  }
  if (abs >= 100000) {
    return `${sign}₹${(abs / 100000).toFixed(1)}L`;
  }
  if (abs >= 1000) {
    return `${sign}₹${Math.round(abs / 1000)}K`;
  }
  return formatCurrency(amount);
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function toDateInputValue(date: Date = new Date()): string {
  return date.toISOString().split("T")[0];
}
