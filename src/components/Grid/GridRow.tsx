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
    ? 'bg-blue-50 hover:bg-blue-100'
    : rowIndex % 2 === 0
      ? 'bg-white hover:bg-slate-50'
      : 'bg-slate-50/50 hover:bg-slate-100/50';

  return (
    <div
      role="row"
      aria-rowindex={rowIndex + 2}
      aria-selected={isSelected}
      onClick={(e) => onRowClick(order.id, e.shiftKey)}
      onDoubleClick={() => onRowDoubleClick?.(order)}
      style={style}
      className={`flex h-8 border-b border-slate-100 cursor-pointer transition-colors duration-75 ${bgClass} ${
        isSelected ? 'border-l-2 border-l-blue-500' : ''
      }`}
    >
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
