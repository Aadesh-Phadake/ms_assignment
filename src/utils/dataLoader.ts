/**
 * dataLoader.ts
 *
 * Fetches orders.json from public/ and normalizes it.
 * We load from public/ via fetch() because:
 *  - 17MB would bloat the JS bundle if imported directly
 *  - fetch() streams the data and lets the browser cache it
 *  - No backend needed — it's a static file
 */

import type { RawOrder, Order } from '../types';
import { normalizeOrders } from './dataCleaner';

export async function loadOrders(): Promise<Order[]> {
  const response = await fetch('/orders.json');
  if (!response.ok) {
    throw new Error(`Failed to load orders: ${response.status} ${response.statusText}`);
  }
  const rawOrders: RawOrder[] = await response.json();
  return normalizeOrders(rawOrders);
}
