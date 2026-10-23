/**
 * useFilteredOrders.ts
 *
 * Applies filters and sorting to the order list.
 * Filtering and sorting are memoized for performance.
 */

import { useMemo } from 'react';
import type { Order, SortState, FilterState, FilterCondition, ColumnKey } from '../types';
import { COLUMNS } from '../utils';

// ── Filter matching ──────────────────────────────────────────────

function getFieldValue(order: Order, field: ColumnKey): string | number | Date | null {
  const val = order[field];
  if (val instanceof Date) return val;
  if (val === null || val === undefined) return null;
  return val;
}

function matchesCondition(order: Order, condition: FilterCondition): boolean {
  const colDef = COLUMNS.find((c) => c.key === condition.field);
  if (!colDef) return true;

  const raw = getFieldValue(order, condition.field);
  const value = condition.value;

  if (colDef.type === 'text') {
    const text = String(raw ?? '').toLowerCase();
    const search = value.toLowerCase();
    switch (condition.operator) {
      case 'contains':
        return text.includes(search);
      case 'does_not_contain':
        return !text.includes(search);
      case 'equals':
        return text === search;
      default:
        return true;
    }
  }

  if (colDef.type === 'number') {
    const num = typeof raw === 'number' ? raw : parseFloat(String(raw ?? '0'));
    switch (condition.operator) {
      case 'eq':
        return num === parseFloat(value);
      case 'gt':
        return num > parseFloat(value);
      case 'lt':
        return num < parseFloat(value);
      case 'between': {
        const [min, max] = value.split(',').map(Number);
        return num >= min && num <= max;
      }
      default:
        return true;
    }
  }

  if (colDef.type === 'date') {
    const date = raw instanceof Date ? raw : null;
    if (!date) return false;
    const ts = date.getTime();
    switch (condition.operator) {
      case 'before':
        return ts < new Date(value).getTime();
      case 'after':
        return ts > new Date(value).getTime();
      case 'between': {
        const [start, end] = value.split(',');
        return ts >= new Date(start).getTime() && ts <= new Date(end).getTime();
      }
      default:
        return true;
    }
  }

  if (colDef.type === 'enum') {
    const fieldVal = condition.field === 'priority'
      ? (raw === null ? 'null' : String(raw))
      : String(raw ?? '').toLowerCase();
    const selected = value.split(',').map((v) => v.trim().toLowerCase());
    switch (condition.operator) {
      case 'is_one_of':
        return selected.includes(fieldVal);
      default:
        return true;
    }
  }

  return true;
}

function matchesGroup(order: Order, conditions: FilterCondition[]): boolean {
  if (conditions.length === 0) return true;
  // Conditions in a group are OR'd
  return conditions.some((cond) => matchesCondition(order, cond));
}

function matchesFilters(order: Order, filters: FilterState): boolean {
  if (filters.length === 0) return true;
  // Groups are AND'd
  return filters.every((group) => matchesGroup(order, group.conditions));
}

// ── Sorting ──────────────────────────────────────────────────────

function compareOrders(a: Order, b: Order, sort: SortState): number {
  const colDef = COLUMNS.find((c) => c.key === sort.column);
  if (!colDef) return 0;

  const valA = a[sort.column];
  const valB = b[sort.column];

  let result = 0;

  if (colDef.type === 'date') {
    const dateA = valA instanceof Date ? valA.getTime() : -Infinity;
    const dateB = valB instanceof Date ? valB.getTime() : -Infinity;
    // null dates go last
    if (valA === null && valB === null) result = 0;
    else if (valA === null) result = 1;
    else if (valB === null) result = -1;
    else result = dateA - dateB;
  } else if (colDef.type === 'number') {
    const numA = typeof valA === 'number' ? valA : 0;
    const numB = typeof valB === 'number' ? valB : 0;
    result = numA - numB;
  } else {
    const strA = String(valA ?? '').toLowerCase();
    const strB = String(valB ?? '').toLowerCase();
    result = strA.localeCompare(strB);
  }

  return sort.direction === 'desc' ? -result : result;
}

// ── Hook ─────────────────────────────────────────────────────────

export function useFilteredOrders(
  orders: Order[],
  filters: FilterState,
  sort: SortState | null
): Order[] {
  return useMemo(() => {
    let result = orders;

    // Apply filters
    if (filters.length > 0) {
      result = result.filter((order) => matchesFilters(order, filters));
    }

    // Apply sorting
    if (sort) {
      result = [...result].sort((a, b) => compareOrders(a, b, sort));
    }

    return result;
  }, [orders, filters, sort]);
}
