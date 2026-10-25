import React from 'react';
import type { Order, ColumnDef, ColumnKey } from '../../types';
import { GridCell } from './GridCell';

interface GridRowProps {
  order: Order;
  columns: ColumnDef[];
  columnWidths: Record<string, number>;
  isSelected: boolean;
  focusedCell: { row: number; col: number } | null;
  rowIndex: number;
  pinnedColumn: ColumnKey | null;
  onRowClick: (orderId: string, shiftKey: boolean) => void;
  onRowDoubleClick?: (order: Order) => void;
  onCellClick: (rowIndex: number, colIndex: number) => void;
  style: React.CSSProperties;
}

export const GridRow: React.FC<GridRowProps> = React.memo(({
  order,
  columns,
  columnWidths,
  isSelected,
  focusedCell,
  rowIndex,
  pinnedColumn,
  onRowClick,
  onRowDoubleClick,
  onCellClick,
  style,
}) => {
  const bgClass = isSelected
    ? 'bg-blue-50/80 hover:bg-blue-100/80'
    : rowIndex % 2 === 0
      ? 'bg-white hover:bg-slate-50/80'
      : 'bg-slate-50/40 hover:bg-slate-100/60';

  return (
    <div
      role="row"
      aria-rowindex={rowIndex + 2}
      aria-selected={isSelected}
      onClick={(e) => onRowClick(order.id, e.shiftKey)}
      onDoubleClick={() => onRowDoubleClick?.(order)}
      style={style}
      className={`flex h-[38px] border-b border-slate-100 cursor-pointer transition-colors duration-75 ${bgClass} ${
        isSelected ? 'border-l-2 border-l-blue-600' : ''
      }`}
    >
      {/* Checkbox Column */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          onRowClick(order.id, e.shiftKey);
        }}
        className={`w-11 min-w-[44px] max-w-[44px] h-[38px] flex items-center justify-center border-r border-slate-200 shrink-0 sticky left-0 z-20 ${
          isSelected ? 'bg-blue-50/90' : 'bg-inherit'
        }`}
      >
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => {}} // handled by onClick on the wrapper
          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
        />
      </div>

      {columns.map((col, colIndex) => {
        const width = columnWidths[col.key] ?? col.width;
        const isPinned = col.key === pinnedColumn;
        const isFocused =
          focusedCell !== null &&
          focusedCell.row === rowIndex &&
          focusedCell.col === colIndex;

        return (
          <GridCell
            key={col.key}
            order={order}
            column={col}
            width={width}
            isPinned={isPinned}
            isFocused={isFocused}
            onCellClick={() => onCellClick(rowIndex, colIndex)}
          />
        );
      })}
    </div>
  );
});

GridRow.displayName = 'GridRow';
