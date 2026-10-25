/**
 * FilterBuilder.tsx
 *
 * Main filter builder panel. Contains groups of conditions.
 * Groups are combined with AND. Conditions within a group use OR.
 */

import React, { useCallback } from 'react';
import type { FilterState, FilterGroup as FilterGroupType, FilterCondition } from '../../types';
import { FilterGroup } from './FilterGroup';
import { Plus } from 'lucide-react';

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
    <aside className="w-80 border-r border-slate-200 bg-white shrink-0 flex flex-col overflow-hidden transition-all duration-200">
      {/* Header */}
      <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-800">Filters</h2>
        </div>
        <button
          onClick={handleAddCondition}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Condition
        </button>
      </div>

      {/* Groups Container */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filters.length === 0 ? (
          <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center">
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              No active conditions. Click <strong className="text-slate-800">Add Condition</strong> to build custom filter logic.
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

      {/* Action footer */}
      <div className="p-3 border-t border-slate-100">
        <button
          onClick={handleAddGroup}
          className="w-full flex items-center justify-center gap-1.5 h-8 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Group
        </button>
      </div>
    </aside>
  );
};
