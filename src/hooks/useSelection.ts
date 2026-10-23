/**
 * useSelection.ts
 *
 * Multi-select logic with shift-click range selection.
 */

import { useCallback } from 'react';
import type { Order } from '../types';

interface UseSelectionResult {
  toggle: (orderId: string, shiftKey: boolean) => void;
  isSelected: (orderId: string) => boolean;
  clear: () => void;
  count: number;
  selectedOrders: Order[];
}

export function useSelection(
  filteredOrders: Order[],
  selectedIds: Set<string>,
  setSelectedIds: (ids: Set<string>) => void,
  lastSelectedIndex: React.MutableRefObject<number | null>
): UseSelectionResult {
  const toggle = useCallback(
    (orderId: string, shiftKey: boolean) => {
      const next = new Set(selectedIds);
      const currentIndex = filteredOrders.findIndex((o) => o.id === orderId);

      if (shiftKey && lastSelectedIndex.current !== null && currentIndex !== -1) {
        // Range select
        const start = Math.min(lastSelectedIndex.current, currentIndex);
        const end = Math.max(lastSelectedIndex.current, currentIndex);
        for (let i = start; i <= end; i++) {
          next.add(filteredOrders[i].id);
        }
      } else {
        // Toggle single
        if (next.has(orderId)) {
          next.delete(orderId);
        } else {
          next.add(orderId);
        }
        lastSelectedIndex.current = currentIndex;
      }

      setSelectedIds(next);
    },
    [filteredOrders, selectedIds, setSelectedIds, lastSelectedIndex]
  );

  const isSelected = useCallback(
    (orderId: string) => selectedIds.has(orderId),
    [selectedIds]
  );

  const clear = useCallback(() => {
    setSelectedIds(new Set());
    lastSelectedIndex.current = null;
  }, [setSelectedIds, lastSelectedIndex]);

  // For export: only orders that are both selected AND in the filtered list
  const selectedOrders = filteredOrders.filter((o) => selectedIds.has(o.id));

  return {
    toggle,
    isSelected,
    clear,
    count: selectedOrders.length,
    selectedOrders,
  };
}
