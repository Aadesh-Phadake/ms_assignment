import React from 'react';
import type { ColumnDef, ColumnKey, SortState, SortDirection } from '../../types';
import { ColumnResizer } from './ColumnResizer';
import { ArrowUp, ArrowDown, ArrowUpDown, Pin } from 'lucide-react';

interface GridHeaderProps {
  columns: ColumnDef[];
  columnWidths: Record<string, number>;
  sort: SortState | null;
  pinnedColumn: ColumnKey | null;
  onSort: (column: ColumnKey) => void;
  onResize: (column: ColumnKey, width: number) => void;
  onPin: (column: ColumnKey) => void;
  isAllSelected: boolean;
  onToggleSelectAll: () => void;
}

export const GridHeader: React.FC<GridHeaderProps> = ({
  columns,
  columnWidths,
  sort,
  pinnedColumn,
  onSort,
  onResize,
  onPin,
  isAllSelected,
  onToggleSelectAll,
}) => {
  return (
    <div
      role="row"
      aria-rowindex={1}
      className="flex h-10 bg-slate-50 border-b border-slate-200 sticky top-0 z-30 select-none text-slate-600 font-medium"
    >
      {/* Checkbox Master Column */}
      <div
        className="w-11 min-w-[44px] max-w-[44px] h-10 flex items-center justify-center border-r border-slate-200 shrink-0 sticky left-0 z-40 bg-slate-50"
      >
        <input
          type="checkbox"
          checked={isAllSelected}
          onChange={onToggleSelectAll}
          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
          title={isAllSelected ? "Deselect all" : "Select all visible"}
        />
      </div>

      {columns.map((col) => {
        const width = columnWidths[col.key] ?? col.width;
        const isSorted = sort?.column === col.key;
        const direction: SortDirection | null = isSorted ? sort!.direction : null;
        const isPinned = col.key === pinnedColumn;

        const pinnedClasses = isPinned
          ? 'sticky left-11 z-30 bg-blue-50/70 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.12)] border-r border-slate-300'
          : 'border-r border-slate-200';

        let justifyClass = 'justify-center text-center';
        if (col.align === 'right') justifyClass = 'justify-end pr-2';
        if (col.align === 'left') justifyClass = 'justify-start pl-2';

        return (
          <div
            key={col.key}
            role="columnheader"
            aria-sort={isSorted ? (direction === 'asc' ? 'ascending' : 'descending') : 'none'}
            style={{ width: `${width}px`, minWidth: `${width}px`, maxWidth: `${width}px` }}
            className={`group relative h-10 px-2 flex items-center shrink-0 hover:bg-slate-100 transition-colors ${justifyClass} ${pinnedClasses}`}
          >
            {/* Header label and action buttons */}
            <div
              onClick={() => onSort(col.key)}
              className="flex items-center gap-1.5 cursor-pointer truncate"
              title={`Click to sort by ${col.label}`}
            >
              <span
                className={`text-xs font-semibold tracking-tight truncate ${
                  isSorted ? 'text-blue-600' : 'text-slate-700'
                }`}
              >
                {col.label}
              </span>

              {/* Sort Action Icon */}
              <button
                type="button"
                className={`p-0.5 rounded transition-colors ${
                  isSorted
                    ? 'text-blue-600 bg-blue-100/50'
                    : 'text-slate-400 group-hover:text-slate-600'
                }`}
                title={isSorted ? `Sorted ${direction}` : 'Sort'}
              >
                {isSorted ? (
                  direction === 'asc' ? (
                    <ArrowUp className="w-3.5 h-3.5" />
                  ) : (
                    <ArrowDown className="w-3.5 h-3.5" />
                  )
                ) : (
                  <ArrowUpDown className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100" />
                )}
              </button>
            </div>

            {/* Pin Column Action Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onPin(col.key);
              }}
              className={`ml-1 p-0.5 rounded transition-all ${
                isPinned
                  ? 'text-blue-600 bg-blue-100 opacity-100'
                  : 'text-slate-300 hover:text-slate-600 group-hover:opacity-100 opacity-0'
              }`}
              title={isPinned ? 'Unpin column' : 'Pin column to left'}
            >
              <Pin className={`w-3.5 h-3.5 ${isPinned ? 'fill-blue-600' : ''}`} />
            </button>

            {/* Resize handle */}
            <ColumnResizer
              currentWidth={width}
              minWidth={col.minWidth}
              onResize={(newWidth) => onResize(col.key, newWidth)}
            />
          </div>
        );
      })}
    </div>
  );
};
