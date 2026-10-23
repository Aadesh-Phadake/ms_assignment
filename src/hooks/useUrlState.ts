/**
 * useUrlState.ts
 *
 * Syncs app state (filters, sort, pin, selection) to URL search params.
 * Reads state on mount, writes on every change.
 * Handles malformed URLs gracefully.
 */

import { useCallback, useEffect, useRef } from 'react';
import type { SortState, ColumnKey, FilterState } from '../types';
import { encodeUrlState, decodeUrlState } from '../utils';

interface UrlStateActions {
  sort: SortState | null;
  pinnedColumn: ColumnKey | null;
  selectedIds: Set<string>;
  filters: FilterState;
}

export function useUrlState(
  state: UrlStateActions,
  onRestore: (restored: UrlStateActions) => void
) {
  const initialized = useRef(false);

  // Read from URL on first mount
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    try {
      const restored = decodeUrlState(window.location.search);
      onRestore(restored);
    } catch {
      // Malformed URL — ignore, use defaults
    }
  }, [onRestore]);

  // Write to URL on state change
  const updateUrl = useCallback(() => {
    const encoded = encodeUrlState(state);
    const newUrl = window.location.pathname + encoded;
    window.history.replaceState(null, '', newUrl);
  }, [state]);

  useEffect(() => {
    if (!initialized.current) return;
    updateUrl();
  }, [updateUrl]);
}
