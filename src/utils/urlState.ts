/**
 * urlState.ts
 *
 * Serialize and deserialize app state to/from URL search params.
 * State includes: filters, sort, pinned column, selected rows.
 *
 * Format:
 *   ?sort=amount:desc
 *   &pin=id
 *   &selected=ORD-0001,ORD-0002
 *   &filters=<base64-encoded JSON>
 */

import type { SortState, ColumnKey, FilterState } from '../types';

export interface AppUrlState {
  sort: SortState | null;
  pinnedColumn: ColumnKey | null;
  selectedIds: Set<string>;
  filters: FilterState;
}

const VALID_COLUMNS: Set<string> = new Set([
  'id', 'customerName', 'customerEmail', 'status', 'amount',
  'currency', 'createdAt', 'updatedAt', 'region', 'channel',
  'priority', 'paymentMethod', 'itemCount', 'notes',
]);

export function encodeUrlState(state: AppUrlState): string {
  const params = new URLSearchParams();

  if (state.sort) {
    params.set('sort', `${state.sort.column}:${state.sort.direction}`);
  }

  if (state.pinnedColumn) {
    params.set('pin', state.pinnedColumn);
  }

  if (state.selectedIds.size > 0) {
    // Cap at 200 IDs in URL to avoid excessively long URLs
    const ids = Array.from(state.selectedIds).slice(0, 200);
    params.set('selected', ids.join(','));
  }

  if (state.filters.length > 0) {
    try {
      // Use encodeURIComponent to handle Unicode in filter values
      const json = JSON.stringify(state.filters);
      const encoded = btoa(unescape(encodeURIComponent(json)));
      params.set('filters', encoded);
    } catch {
      // Silently skip if encoding fails
    }
  }

  const str = params.toString();
  return str ? `?${str}` : '';
}

export function decodeUrlState(search: string): AppUrlState {
  const params = new URLSearchParams(search);
  const result: AppUrlState = {
    sort: null,
    pinnedColumn: null,
    selectedIds: new Set(),
    filters: [],
  };

  // Parse sort
  const sortStr = params.get('sort');
  if (sortStr) {
    const [col, dir] = sortStr.split(':');
    if (VALID_COLUMNS.has(col) && (dir === 'asc' || dir === 'desc')) {
      result.sort = { column: col as ColumnKey, direction: dir };
    }
  }

  // Parse pinned column
  const pinStr = params.get('pin');
  if (pinStr && VALID_COLUMNS.has(pinStr)) {
    result.pinnedColumn = pinStr as ColumnKey;
  }

  // Parse selected IDs
  const selectedStr = params.get('selected');
  if (selectedStr) {
    const ids = selectedStr.split(',').filter((id) => id.startsWith('ORD-'));
    result.selectedIds = new Set(ids);
  }

  // Parse filters
  const filtersStr = params.get('filters');
  if (filtersStr) {
    try {
      // Decode Unicode-safe base64
      const json = decodeURIComponent(escape(atob(filtersStr)));
      const decoded = JSON.parse(json);
      if (Array.isArray(decoded)) {
        result.filters = decoded;
      }
    } catch {
      // Malformed filters — fall back to empty
    }
  }

  return result;
}
