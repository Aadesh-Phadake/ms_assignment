/**
 * FilterInputs.tsx
 *
 * Type-specific value inputs for filter conditions.
 * - Text: free text input
 * - Number: number input (or two inputs for "between")
 * - Date: date input (or two inputs for "between")
 * - Enum: multi-select checkboxes from a fixed set
 */

import React, { useCallback } from 'react';
import type { ColumnDef, FilterOperator } from '../../types';
import {
  formatStatus,
  formatRegion,
  formatChannel,
  formatPaymentMethod,
  formatPriority,
} from '../../utils';

interface FilterInputProps {
  column: ColumnDef;
  operator: FilterOperator;
  value: string;
  onChange: (value: string) => void;
}

// ── Display label for enum values ────────────────────────────────
function getEnumLabel(columnKey: string, val: string): string {
  switch (columnKey) {
    case 'status':
      return formatStatus(val);
    case 'region':
      return formatRegion(val);
    case 'channel':
      return formatChannel(val);
    case 'paymentMethod':
      return formatPaymentMethod(val);
    case 'priority':
      return val === 'null' ? 'None' : formatPriority(Number(val));
    default:
      return val;
  }
}

// ── Text Input ───────────────────────────────────────────────────
const TextFilterInput: React.FC<FilterInputProps> = ({ value, onChange }) => {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Enter text…"
      className="w-full h-7 px-2 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
    />
  );
};

// ── Number Input ─────────────────────────────────────────────────
const NumberFilterInput: React.FC<FilterInputProps> = ({ operator, value, onChange }) => {
  if (operator === 'between') {
    const parts = value.split(',');
    const min = parts[0] || '';
    const max = parts[1] || '';

    return (
      <div className="flex items-center gap-1">
        <input
          type="number"
          value={min}
          onChange={(e) => onChange(`${e.target.value},${max}`)}
          placeholder="Min"
          className="w-full h-7 px-2 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
        />
        <span className="text-xs text-slate-400 shrink-0">to</span>
        <input
          type="number"
          value={max}
          onChange={(e) => onChange(`${min},${e.target.value}`)}
          placeholder="Max"
          className="w-full h-7 px-2 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
        />
      </div>
    );
  }

  return (
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Enter number…"
      className="w-full h-7 px-2 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
    />
  );
};

// ── Date Input ───────────────────────────────────────────────────
const DateFilterInput: React.FC<FilterInputProps> = ({ operator, value, onChange }) => {
  if (operator === 'between') {
    const parts = value.split(',');
    const start = parts[0] || '';
    const end = parts[1] || '';

    return (
      <div className="flex items-center gap-1">
        <input
          type="date"
          value={start}
          onChange={(e) => onChange(`${e.target.value},${end}`)}
          className="w-full h-7 px-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
        />
        <span className="text-xs text-slate-400 shrink-0">to</span>
        <input
          type="date"
          value={end}
          onChange={(e) => onChange(`${start},${e.target.value}`)}
          className="w-full h-7 px-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
        />
      </div>
    );
  }

  return (
    <input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-7 px-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
    />
  );
};

// ── Enum Multi-Select ────────────────────────────────────────────
const EnumFilterInput: React.FC<FilterInputProps> = ({ column, value, onChange }) => {
  const options = column.enumValues || [];
  const selected = new Set(value ? value.split(',').map((v) => v.trim()) : []);

  const handleToggle = useCallback(
    (opt: string) => {
      const next = new Set(selected);
      if (next.has(opt)) {
        next.delete(opt);
      } else {
        next.add(opt);
      }
      onChange(Array.from(next).join(','));
    },
    [selected, onChange]
  );

  return (
    <div className="flex flex-wrap gap-1 py-1">
      {options.map((opt) => {
        const isActive = selected.has(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => handleToggle(opt)}
            className={`px-2 py-0.5 text-[11px] rounded border transition-colors ${
              isActive
                ? 'bg-blue-100 border-blue-300 text-blue-800 font-medium'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {getEnumLabel(column.key, opt)}
          </button>
        );
      })}
    </div>
  );
};

// ── Main Export ───────────────────────────────────────────────────
export const FilterInput: React.FC<FilterInputProps> = (props) => {
  switch (props.column.type) {
    case 'text':
      return <TextFilterInput {...props} />;
    case 'number':
      return <NumberFilterInput {...props} />;
    case 'date':
      return <DateFilterInput {...props} />;
    case 'enum':
      return <EnumFilterInput {...props} />;
    default:
      return <TextFilterInput {...props} />;
  }
};
