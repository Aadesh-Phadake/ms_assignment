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
  if (!condition.value || condition.value.trim() === '') return true;

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
      case 'eq': {
        const target = parseFloat(value);
        return isNaN(target) ? true : num === target;
      }
      case 'gt': {
        const target = parseFloat(value);
        return isNaN(target) ? true : num > target;
      }
      case 'lt': {
        const target = parseFloat(value);
        return isNaN(target) ? true : num < target;
      }
      case 'between': {
        const parts = value.split(',');
        const min = parts[0] ? parseFloat(parts[0]) : null;
        const max = parts[1] ? parseFloat(parts[1]) : null;
        if (min !== null && !isNaN(min) && num < min) return false;
        if (max !== null && !isNaN(max) && num > max) return false;
        return true;
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
      case 'before': {
        const target = new Date(value).getTime();
        return isNaN(target) ? true : ts < target;
      }
      case 'after': {
        const target = new Date(value).getTime();
        return isNaN(target) ? true : ts > target;
      }
      case 'between': {
        const parts = value.split(',');
        const start = parts[0] ? new Date(parts[0]).getTime() : null;
        const end = parts[1] ? new Date(parts[1]).getTime() : null;
        if (start !== null && !isNaN(start) && ts < start) return false;
        if (end !== null && !isNaN(end) && ts > end) return false;
        return true;
      }
      default:
        return true;
    }
  }

  if (colDef.type === 'enum') {
    const fieldVal = condition.field === 'priority'
      ? (raw === null ? 'null' : String(raw))
      : String(raw ?? '').toLowerCase();
    const selected = value
      .split(',')
      .map((v) => v.trim().toLowerCase())
      .filter(Boolean);
    if (selected.length === 0) return true;
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
