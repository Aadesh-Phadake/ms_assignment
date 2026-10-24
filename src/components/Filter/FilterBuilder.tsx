/**
 * FilterBuilder.tsx
 *
 * Main filter builder panel. Contains groups of conditions.
 * Groups are combined with AND. Conditions within a group use OR.
 */

import React, { useCallback } from 'react';
import type { FilterState, FilterGroup as FilterGroupType, FilterCondition } from '../../types';
import { FilterGroup } from './FilterGroup';
import { Plus, Filter } from 'lucide-react';

interface FilterBuilderProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

let groupIdCounter = 0;
function newGroupId(): string {
  return `group-${Date.now()}-${++groupIdCounter}`;
}

let conditionIdCounter = 100;
function newConditionId(): string {
  return `cond-${Date.now()}-${++conditionIdCounter}`;
}

export const FilterBuilder: React.FC<FilterBuilderProps> = ({ filters, onChange }) => {
  const handleGroupChange = useCallback(
    (index: number, updated: FilterGroupType) => {
      const next = [...filters];
      next[index] = updated;
      onChange(next);
    },
    [filters, onChange]
  );

  const handleGroupRemove = useCallback(
    (index: number) => {
      onChange(filters.filter((_, i) => i !== index));
    },
    [filters, onChange]
  );

  const handleAddGroup = useCallback(() => {
    const newCondition: FilterCondition = {
      id: newConditionId(),
      field: 'status',
      operator: 'is_one_of',
      value: '',
    };
    const newGroup: FilterGroupType = {
      id: newGroupId(),
      conditions: [newCondition],
    };
    onChange([...filters, newGroup]);
  }, [filters, onChange]);

  const handleAddCondition = useCallback(() => {
    // If there are groups, add a condition to the last group
    // Otherwise, create a new group
    if (filters.length > 0) {
      const lastGroup = filters[filters.length - 1];
      const newCondition: FilterCondition = {
        id: newConditionId(),
        field: 'status',
        operator: 'is_one_of',
        value: '',
      };
      const next = [...filters];
      next[next.length - 1] = {
        ...lastGroup,
        conditions: [...lastGroup.conditions, newCondition],
      };
      onChange(next);
    } else {
      handleAddGroup();
    }
  }, [filters, onChange, handleAddGroup]);

  return (
    <aside className="w-72 border-r border-slate-200 bg-white shrink-0 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-slate-100">
        <div className="flex items-center gap-2 mb-1">
          <Filter className="w-4 h-4 text-slate-600" />
          <h2 className="text-sm font-bold text-slate-800">Filter Builder</h2>
        </div>
        <p className="text-[11px] text-slate-500">
          Conditions in a group are <span className="font-semibold text-slate-600">OR</span>. Groups
          are <span className="font-semibold text-slate-600">AND</span>.
        </p>
      </div>

      {/* Groups */}
      <div className="flex-1 overflow-y-auto p-3 space-y-0">
        {filters.length === 0 ? (
          <div className="border-2 border-dashed border-slate-200 rounded-lg p-5 text-center">
            <Filter className="w-6 h-6 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-400 mb-3">No filters applied</p>
            <p className="text-[10px] text-slate-400">
              Add a condition or group to narrow results
            </p>
          </div>
        ) : (
          filters.map((group, index) => (
            <FilterGroup
              key={group.id}
              group={group}
              groupIndex={index}
              onChange={(updated) => handleGroupChange(index, updated)}
              onRemove={() => handleGroupRemove(index)}
              showAndLabel={index > 0}
            />
          ))
        )}
      </div>

      {/* Action buttons */}
      <div className="p-3 border-t border-slate-100 space-y-1.5">
        <button
          onClick={handleAddCondition}
          className="w-full flex items-center justify-center gap-1.5 h-8 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Condition
        </button>
        <button
          onClick={handleAddGroup}
          className="w-full flex items-center justify-center gap-1.5 h-8 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Group
        </button>
      </div>
    </aside>
  );
};
