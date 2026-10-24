/**
 * FilterCondition.tsx
 *
 * A single filter condition: field selector + operator selector + value input.
 */

import React, { useCallback } from 'react';
import type { FilterCondition as FilterConditionType, ColumnKey, FilterOperator } from '../../types';
import { COLUMNS } from '../../utils';
import { FilterInput } from './FilterInputs';
import { X } from 'lucide-react';

// Operators available per column type
const OPERATORS_BY_TYPE: Record<string, { value: FilterOperator; label: string }[]> = {
  text: [
    { value: 'contains', label: 'Contains' },
    { value: 'does_not_contain', label: 'Does not contain' },
    { value: 'equals', label: 'Equals' },
  ],
  number: [
    { value: 'eq', label: 'Equals' },
    { value: 'gt', label: 'Greater than' },
    { value: 'lt', label: 'Less than' },
    { value: 'between', label: 'Between' },
  ],
  date: [
    { value: 'before', label: 'Before' },
    { value: 'after', label: 'After' },
    { value: 'between', label: 'Between' },
  ],
  enum: [
    { value: 'is_one_of', label: 'Is one of' },
  ],
};

// Default operator for each column type
const DEFAULT_OPERATOR: Record<string, FilterOperator> = {
  text: 'contains',
  number: 'gt',
  date: 'after',
  enum: 'is_one_of',
};

interface FilterConditionProps {
  condition: FilterConditionType;
  onChange: (updated: FilterConditionType) => void;
  onRemove: () => void;
  showOrLabel: boolean;
}

// Filterable columns (exclude currency since it's always INR)
const FILTERABLE_COLUMNS = COLUMNS.filter((c) => c.key !== 'currency');

export const FilterConditionRow: React.FC<FilterConditionProps> = ({
  condition,
  onChange,
  onRemove,
  showOrLabel,
}) => {
  const selectedColumn = COLUMNS.find((c) => c.key === condition.field);
  const columnType = selectedColumn?.type || 'text';
  const operators = OPERATORS_BY_TYPE[columnType] || OPERATORS_BY_TYPE.text;

  const handleFieldChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newField = e.target.value as ColumnKey;
      const newCol = COLUMNS.find((c) => c.key === newField);
      const newType = newCol?.type || 'text';
      const newOp = DEFAULT_OPERATOR[newType];
      onChange({ ...condition, field: newField, operator: newOp, value: '' });
    },
    [condition, onChange]
  );

  const handleOperatorChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onChange({ ...condition, operator: e.target.value as FilterOperator, value: '' });
    },
    [condition, onChange]
  );

  const handleValueChange = useCallback(
    (value: string) => {
      onChange({ ...condition, value });
    },
    [condition, onChange]
  );

  return (
    <div className="relative">
      {showOrLabel && (
        <div className="flex items-center gap-2 py-1">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">OR</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-md p-2 space-y-1.5">
        {/* Header row: field selector + remove */}
        <div className="flex items-center gap-1.5">
          <select
            value={condition.field}
            onChange={handleFieldChange}
            className="flex-1 h-7 px-1.5 text-xs border border-slate-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            {FILTERABLE_COLUMNS.map((col) => (
              <option key={col.key} value={col.key}>
                {col.label}
              </option>
            ))}
          </select>

          <select
            value={condition.operator}
            onChange={handleOperatorChange}
            className="flex-1 h-7 px-1.5 text-xs border border-slate-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            {operators.map((op) => (
              <option key={op.value} value={op.value}>
                {op.label}
              </option>
            ))}
          </select>

          <button
            onClick={onRemove}
            className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors shrink-0"
            title="Remove condition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Value input */}
        {selectedColumn && (
          <FilterInput
            column={selectedColumn}
            operator={condition.operator}
            value={condition.value}
            onChange={handleValueChange}
          />
        )}
      </div>
    </div>
  );
};
