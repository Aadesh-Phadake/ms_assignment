/**
 * useOrders.ts
 *
 * Loads and caches the cleaned order data.
 */

import { useState, useEffect } from 'react';
import type { Order } from '../types';
import { loadOrders } from '../utils';

interface UseOrdersResult {
  orders: Order[];
  loading: boolean;
  error: string | null;
  totalCount: number;
}

export function useOrders(): UseOrdersResult {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    loadOrders()
      .then((data) => {
        if (!cancelled) {
          setOrders(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || 'Failed to load orders');
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { orders, loading, error, totalCount: orders.length };
}
