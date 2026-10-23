/**
 * dataCleaner.ts
 *
 * All data-cleaning logic lives here. Every fix from data-notes.md
 * is applied in normalizeOrders() before data reaches any component.
 */

import type { RawOrder, Order, OrderStatus, OrderRegion, OrderChannel, OrderPaymentMethod, OrderPriority } from '../types';

// ── Date parsing (fix #4) ────────────────────────────────────────
function parseDate(value: string | number | undefined | null): Date | null {
  if (value === undefined || value === null || value === '') return null;

  // Epoch seconds (number)
  if (typeof value === 'number') {
    return new Date(value * 1000);
  }

  const str = String(value).trim();

  // DD/MM/YYYY format
  const ddmmyyyy = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (ddmmyyyy) {
    const [, day, month, year] = ddmmyyyy;
    return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  }

  // ISO without timezone (e.g. "2025-03-14T09:30:00") -> treat as UTC (fix #4)
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?$/.test(str)) {
    return new Date(str + 'Z');
  }

  const isoDate = new Date(str);
  if (!isNaN(isoDate.getTime())) {
    return isoDate;
  }

  return null;
}

// ── Normalize a single raw order into clean Order ────────────────
function normalizeOrder(raw: RawOrder): Order {
  // Fix #1: Merge customer_name / customerName
  const customerName = (raw.customerName || raw.customer_name || '').trim();

  // Fix #2 & #3: Amount — string → number, paise → rupees
  let amount = typeof raw.amount === 'string' ? parseFloat(raw.amount) : raw.amount;
  if (isNaN(amount)) amount = 0;
  if (raw.schemaVersion === 1) {
    amount = amount / 100; // paise → rupees
  }

  // Fix #4: Parse dates
  const createdAt = parseDate(raw.createdAt) || new Date(0);
  const updatedAt = parseDate(raw.updatedAt); // null if missing/null (fix #5)

  // Fix #6: Normalize casing for status and region
  const status = String(raw.status).toLowerCase().trim() as OrderStatus;
  const region = String(raw.region).toLowerCase().trim() as OrderRegion;

  // Fix #8: Priority — missing → null
  const priority: OrderPriority =
    raw.priority === 1 || raw.priority === 2 || raw.priority === 3
      ? raw.priority
      : null;

  // Fix #9: Notes — always string, never rendered as HTML
  const notes = raw.notes != null ? String(raw.notes) : '';

  // Fix #10: Trim currency
  const currency = String(raw.currency || 'INR').trim();

  const channel = String(raw.channel).toLowerCase().trim() as OrderChannel;
  const paymentMethod = String(raw.paymentMethod).toLowerCase().trim() as OrderPaymentMethod;

  return {
    id: raw.id,
    customerName,
    customerEmail: (raw.customerEmail || '').trim(),
    status,
    amount,
    currency,
    createdAt,
    updatedAt,
    region,
    channel,
    priority,
    paymentMethod,
    itemCount: typeof raw.itemCount === 'number' ? raw.itemCount : 0,
    notes,
  };
}

// ── Deduplicate orders (fix #7) ──────────────────────────────────
function deduplicateOrders(orders: Order[]): Order[] {
  const seen = new Map<string, { order: Order; fileIndex: number }>();

  orders.forEach((order, index) => {
    const existing = seen.get(order.id);
    if (!existing) {
      seen.set(order.id, { order, fileIndex: index });
      return;
    }

    // Decide which to keep
    const existingHasUpdated = existing.order.updatedAt !== null;
    const newHasUpdated = order.updatedAt !== null;

    if (existingHasUpdated && newHasUpdated) {
      // Both have updatedAt — keep the later one
      if (order.updatedAt!.getTime() > existing.order.updatedAt!.getTime()) {
        seen.set(order.id, { order, fileIndex: index });
      }
    } else if (newHasUpdated && !existingHasUpdated) {
      // Only new has updatedAt — keep new
      seen.set(order.id, { order, fileIndex: index });
    } else if (!newHasUpdated && !existingHasUpdated) {
      // Neither has updatedAt — keep later in file
      seen.set(order.id, { order, fileIndex: index });
    }
    // else: only existing has updatedAt — keep existing (do nothing)
  });

  return Array.from(seen.values())
    .sort((a, b) => a.fileIndex - b.fileIndex)
    .map((v) => v.order);
}

// ── Main entry point ─────────────────────────────────────────────
export function normalizeOrders(rawOrders: RawOrder[]): Order[] {
  const normalized = rawOrders.map(normalizeOrder);
  return deduplicateOrders(normalized);
}
