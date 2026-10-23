/**
 * formatters.ts
 *
 * Display formatting for amounts and dates.
 */

// ── INR formatting (Indian number system) ────────────────────────
// Example: 123456.5 → "₹1,23,456.50"
const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatINR(amount: number): string {
  return inrFormatter.format(amount);
}

// ── Date formatting ──────────────────────────────────────────────
// Compact format for dense grid: "14 Mar 2025, 09:30"
const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: 'UTC',
});

export function formatDate(date: Date | null): string {
  if (!date) return '—';
  return dateFormatter.format(date);
}

// ── Status display (capitalize first letter) ─────────────────────
export function formatStatus(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

// ── Region display ───────────────────────────────────────────────
export function formatRegion(region: string): string {
  if (region === 'northeast') return 'Northeast';
  return region.charAt(0).toUpperCase() + region.slice(1);
}

// ── Priority display ─────────────────────────────────────────────
export function formatPriority(priority: number | null): string {
  if (priority === null) return 'None';
  return String(priority);
}

// ── Channel & Payment display ────────────────────────────────────
export function formatChannel(channel: string): string {
  return channel.charAt(0).toUpperCase() + channel.slice(1);
}

export function formatPaymentMethod(method: string): string {
  const map: Record<string, string> = {
    upi: 'UPI',
    cod: 'COD',
    card: 'Card',
    netbanking: 'Net Banking',
    wallet: 'Wallet',
  };
  return map[method] || method;
}
