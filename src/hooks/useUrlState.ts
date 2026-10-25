/**
 * useUrlState.ts
 *
 * Syncs app state (filters, sort, pin, selection) to URL search params.
 * Reads state on mount, writes on every change.
 * Handles malformed URLs gracefully — shows a warning toast and falls back to defaults.
 */

import { useEffect, useRef } from 'react';
import type { SortState, ColumnKey, FilterState } from '../types';
import { encodeUrlState, decodeUrlState } from '../utils';

export interface UrlSyncState {
  sort: SortState | null;
  pinnedColumn: ColumnKey | null;
  selectedIds: Set<string>;
  filters: FilterState;
}

/**
 * Reads URL state once on mount, then writes state to URL on every change.
 * Returns { restored, urlError } on first call.
 */
export function useUrlState(
  state: UrlSyncState,
  onRestore: (restored: UrlSyncState) => void
): { urlError: string | null } {
  const initialized = useRef(false);
  const urlError = useRef<string | null>(null);

  // Read from URL on first mount
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const search = window.location.search;
    if (!search) return;

    try {
      const restored = decodeUrlState(search);
      onRestore(restored);
    } catch (e) {
      urlError.current = `Invalid URL parameters were ignored. Using default view. (${e instanceof Error ? e.message : 'Unknown error'})`;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Write to URL on state change (skip the initial restore cycle)
  const skipNext = useRef(true);
  useEffect(() => {
    if (skipNext.current) {
      skipNext.current = false;
      return;
    }
    if (!initialized.current) return;

    const encoded = encodeUrlState(state);
    const newUrl = window.location.pathname + encoded;
    window.history.replaceState(null, '', newUrl);
  }, [state]);

  return { urlError: urlError.current };
}
