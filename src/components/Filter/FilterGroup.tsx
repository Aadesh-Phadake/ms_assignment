/**
 * FilterGroup.tsx
 *
 * A group of filter conditions joined by OR.
 * Multiple groups are joined by AND (handled in FilterBuilder).
 */

import React, { useCallback } from 'react';
import type { FilterGroup as FilterGroupType, FilterCondition } from '../../types';
import { FilterConditionRow } from './FilterCondition';
import { Plus, Trash2 } from 'lucide-react';

interface FilterGroupProps {
  group: FilterGroupType;
  groupIndex: number;
  onChange: (updated: FilterGroupType) => void;
  onRemove: () => void;
  showAndLabel: boolean;
}

let conditionIdCounter = 0;
function newConditionId(): string {
  return `cond-${Date.now()}-${++conditionIdCounter}`;
}

export const FilterGroup: React.FC<FilterGroupProps> = ({
  group,
  groupIndex,
  onChange,
  onRemove,
  showAndLabel,
}) => {
  const handleConditionChange = useCallback(
    (index: number, updated: FilterCondition) => {
      const newConditions = [...group.conditions];
      newConditions[index] = updated;
      onChange({ ...group, conditions: newConditions });
    },
    [group, onChange]
  );

  const handleConditionRemove = useCallback(
    (index: number) => {
      const newConditions = group.conditions.filter((_, i) => i !== index);
      if (newConditions.length === 0) {
        // Remove the whole group if last condition removed
        onRemove();
      } else {
        onChange({ ...group, conditions: newConditions });
      }
    },
    [group, onChange, onRemove]
  );

  const handleAddCondition = useCallback(() => {
    const newCondition: FilterCondition = {
      id: newConditionId(),
      field: 'status',
      operator: 'is_one_of',
      value: '',
    };
    onChange({ ...group, conditions: [...group.conditions, newCondition] });
  }, [group, onChange]);

  return (
    <div>
      {showAndLabel && (
        <div className="flex items-center gap-2 py-2">
          <div className="flex-1 h-px bg-blue-200" />
          <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded">
            AND
          </span>
          <div className="flex-1 h-px bg-blue-200" />
        </div>
      )}

      <div className="border border-dashed border-slate-300 rounded-lg p-2.5 bg-slate-50/50">
        {/* Group header */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Group {groupIndex + 1}
          </span>
          <button
            onClick={onRemove}
            className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-red-500 transition-colors"
            title="Remove group"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>

        {/* Conditions */}
        <div className="space-y-0">
          {group.conditions.map((condition, index) => (
            <FilterConditionRow
              key={condition.id}
              condition={condition}
              onChange={(updated) => handleConditionChange(index, updated)}
              onRemove={() => handleConditionRemove(index)}
              showOrLabel={index > 0}
            />
          ))}
        </div>

        {/* Add condition button */}
        <button
          onClick={handleAddCondition}
          className="mt-2 flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add condition
        </button>
      </div>
    </div>
  );
};
