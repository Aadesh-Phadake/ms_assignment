import React from 'react';
import type { ColumnDef, ColumnKey, SortState, SortDirection } from '../../types';
import { ColumnResizer } from './ColumnResizer';
import { ArrowUp, ArrowDown, Pin } from 'lucide-react';

interface GridHeaderProps {
  columns: ColumnDef[];
  columnWidths: Record<string, number>;
  sort: SortState | null;
  pinnedColumn: ColumnKey | null;
  onSort: (column: ColumnKey) => void;
  onResize: (column: ColumnKey, width: number) => void;
  onPin: (column: ColumnKey) => void;
}

export const GridHeader: React.FC<GridHeaderProps> = ({
  columns,
  columnWidths,
  sort,
  pinnedColumn,
  onSort,
  onResize,
  onPin,
}) => {
  return (
    <div
      role="row"
      aria-rowindex={1}
      className="flex h-9 bg-slate-100 border-b-2 border-slate-300 sticky top-0 z-30 select-none"
    >
      {columns.map((col) => {
        const width = columnWidths[col.key] ?? col.width;
        const isSorted = sort?.column === col.key;
        const direction: SortDirection | null = isSorted ? sort!.direction : null;
        const isPinned = col.key === pinnedColumn;

        const pinnedClasses = isPinned
          ? 'sticky left-0 z-30 bg-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.15)] border-r border-slate-300'
          : 'border-r border-slate-200';

        return (
          <div
            key={col.key}
            role="columnheader"
            aria-sort={isSorted ? (direction === 'asc' ? 'ascending' : 'descending') : 'none'}
            style={{ width: `${width}px`, minWidth: `${width}px`, maxWidth: `${width}px` }}
            className={`group relative h-9 px-2 flex items-center gap-1 shrink-0 cursor-pointer hover:bg-slate-200 transition-colors ${pinnedClasses}`}
            onClick={() => onSort(col.key)}
            onContextMenu={(e) => {
              e.preventDefault();
              onPin(col.key);
            }}
          >
            <span
              className={`text-[11px] font-semibold uppercase tracking-wider truncate ${
                col.align === 'right' ? 'ml-auto' : ''
              } ${isSorted ? 'text-blue-700' : 'text-slate-600'}`}
            >
              {col.label}
            </span>

            {/* Sort indicator */}
            {isSorted && (
              <span className="flex-shrink-0">
                {direction === 'asc' ? (
                  <ArrowUp className="w-3 h-3 text-blue-600" />
                ) : (
                  <ArrowDown className="w-3 h-3 text-blue-600" />
                )}
              </span>
            )}

            {/* Pin indicator */}
            {isPinned && (
              <Pin className="w-3 h-3 text-blue-500 flex-shrink-0" />
            )}

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
