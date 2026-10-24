/**
 * FilterChips.tsx
 *
 * Shows active filters as small removable chips above the grid.
 * Each chip can be removed individually. "Clear all" removes everything.
 */

import React from 'react';
import type { FilterState, FilterCondition } from '../../types';
import { COLUMNS } from '../../utils';
import {
  formatStatus,
  formatRegion,
  formatChannel,
  formatPaymentMethod,
  formatPriority,
} from '../../utils';
import { X } from 'lucide-react';

interface FilterChipsProps {
  filters: FilterState;
  onRemoveCondition: (groupIndex: number, conditionIndex: number) => void;
  onClearAll: () => void;
}

// Build a human-readable label for a condition
function conditionLabel(condition: FilterCondition): string {
  const col = COLUMNS.find((c) => c.key === condition.field);
  const fieldLabel = col?.label || condition.field;

  const operatorLabels: Record<string, string> = {
    contains: 'contains',
    does_not_contain: '≠ contains',
    equals: '=',
    eq: '=',
    gt: '>',
    lt: '<',
    between: 'between',
    before: 'before',
    after: 'after',
    is_one_of: ':',
  };

  const opLabel = operatorLabels[condition.operator] || condition.operator;

  let valueLabel = condition.value;

  // Format enum values nicely
  if (col?.type === 'enum' && condition.value) {
    const values = condition.value.split(',').map((v) => {
      const trimmed = v.trim();
      switch (col.key) {
        case 'status': return formatStatus(trimmed);
        case 'region': return formatRegion(trimmed);
        case 'channel': return formatChannel(trimmed);
        case 'paymentMethod': return formatPaymentMethod(trimmed);
        case 'priority': return trimmed === 'null' ? 'None' : formatPriority(Number(trimmed));
        default: return trimmed;
      }
    });
    valueLabel = values.join(', ');
  }

  // Format number values with ₹
  if (col?.type === 'number' && condition.operator === 'between') {
    const [min, max] = condition.value.split(',');
    valueLabel = `₹${min || '?'} – ₹${max || '?'}`;
  } else if (col?.type === 'number' && condition.value) {
    valueLabel = `₹${condition.value}`;
  }

  if (!valueLabel) return `${fieldLabel} ${opLabel} …`;
  return `${fieldLabel} ${opLabel} ${valueLabel}`;
}

export const FilterChips: React.FC<FilterChipsProps> = ({
  filters,
  onRemoveCondition,
  onClearAll,
}) => {
  // Flatten all conditions with their group/condition indices
  const chips: { label: string; groupIndex: number; conditionIndex: number }[] = [];

  filters.forEach((group, gi) => {
    group.conditions.forEach((cond, ci) => {
      if (cond.value) {
        chips.push({
          label: conditionLabel(cond),
          groupIndex: gi,
          conditionIndex: ci,
        });
      }
    });
  });

  if (chips.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5 px-1 py-1 min-h-[32px] flex-wrap">
      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider shrink-0">
        Filters:
      </span>

      {chips.map((chip, i) => (
        <span
          key={`${chip.groupIndex}-${chip.conditionIndex}-${i}`}
          className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200 rounded"
        >
          <span className="truncate max-w-[180px]">{chip.label}</span>
          <button
            onClick={() => onRemoveCondition(chip.groupIndex, chip.conditionIndex)}
            className="text-slate-400 hover:text-red-500 transition-colors shrink-0"
            title="Remove this filter"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}

      <button
        onClick={onClearAll}
        className="text-[11px] font-semibold text-red-500 hover:text-red-700 transition-colors shrink-0 ml-1"
      >
        Clear all
      </button>
    </div>
  );
};
