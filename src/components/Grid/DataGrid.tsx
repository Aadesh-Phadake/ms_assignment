import React, { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import type { Order, ColumnDef, ColumnKey, SortState } from '../../types';
import { GridHeader } from './GridHeader';
import { GridRow } from './GridRow';

const ROW_HEIGHT = 38;
const OVERSCAN = 10;

interface DataGridProps {
  orders: Order[];
  columns: ColumnDef[];
  sort: SortState | null;
  pinnedColumn: ColumnKey | null;
  selectedIds: Set<string>;
  onSort: (column: ColumnKey) => void;
  onPin: (column: ColumnKey) => void;
  onRowSelect: (orderId: string, shiftKey: boolean) => void;
  onToggleSelectAll: () => void;
  onOpenDetail: (order: Order) => void;
  focusedCell: { row: number; col: number } | null;
  onFocusedCellChange: (cell: { row: number; col: number } | null) => void;
  columnWidths: Record<string, number>;
  onColumnResize: (column: ColumnKey, width: number) => void;
}

export const DataGrid: React.FC<DataGridProps> = ({
  orders,
  columns,
  sort,
  pinnedColumn,
  selectedIds,
  onSort,
  onPin,
  onRowSelect,
  onToggleSelectAll,
  onOpenDetail,
  focusedCell,
  onFocusedCellChange,
  columnWidths,
  onColumnResize,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(600);

  // Measure viewport
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setViewportHeight(entry.contentRect.height);
      }
    });

    observer.observe(el);
    setViewportHeight(el.clientHeight);

    return () => observer.disconnect();
  }, []);

  // Handle scroll
  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (el) {
      setScrollTop(el.scrollTop);
    }
  }, []);

  // Check if all visible are selected
  const isAllSelected = useMemo(
    () => orders.length > 0 && orders.every((o) => selectedIds.has(o.id)),
    [orders, selectedIds]
  );

  // Virtualization calculations
  const totalHeight = orders.length * ROW_HEIGHT;
  const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
  const endIndex = Math.min(
    orders.length - 1,
    Math.ceil((scrollTop + viewportHeight) / ROW_HEIGHT) + OVERSCAN
  );
  const visibleOrders = useMemo(
    () => orders.slice(startIndex, endIndex + 1),
    [orders, startIndex, endIndex]
  );

  // Total width for horizontal scroll (including 44px checkbox column)
  const totalWidth = useMemo(
    () => 44 + columns.reduce((sum, col) => sum + (columnWidths[col.key] ?? col.width), 0),
    [columns, columnWidths]
  );

  // Cell click handler
  const handleCellClick = useCallback(
    (rowIndex: number, colIndex: number) => {
      onFocusedCellChange({ row: rowIndex, col: colIndex });
      scrollContainerRef.current?.focus();
    },
    [onFocusedCellChange]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle when grid has focus
      if (
        !scrollContainerRef.current?.contains(document.activeElement) &&
        document.activeElement !== scrollContainerRef.current
      ) {
        return;
      }

      if (!focusedCell) {
        if (['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
          onFocusedCellChange({ row: 0, col: 0 });
          e.preventDefault();
        }
        return;
      }

      const { row, col } = focusedCell;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          if (row < orders.length - 1) {
            onFocusedCellChange({ row: row + 1, col });
            const newTop = (row + 1) * ROW_HEIGHT;
            if (newTop + ROW_HEIGHT > scrollTop + viewportHeight) {
              scrollContainerRef.current?.scrollTo({
                top: newTop + ROW_HEIGHT - viewportHeight + 40,
              });
            }
          }
          break;

        case 'ArrowUp':
          e.preventDefault();
          if (row > 0) {
            onFocusedCellChange({ row: row - 1, col });
            const newTop = (row - 1) * ROW_HEIGHT;
            if (newTop < scrollTop) {
              scrollContainerRef.current?.scrollTo({ top: newTop });
            }
          }
          break;

        case 'ArrowRight':
          e.preventDefault();
          if (col < columns.length - 1) {
            const nextCol = col + 1;
            onFocusedCellChange({ row, col: nextCol });
            let leftOffset = 44;
            for (let i = 0; i < nextCol; i++) {
              leftOffset += columnWidths[columns[i].key] ?? columns[i].width;
            }
            const colWidth = columnWidths[columns[nextCol].key] ?? columns[nextCol].width;
            const container = scrollContainerRef.current;
            if (container && leftOffset + colWidth > container.scrollLeft + container.clientWidth) {
              container.scrollLeft = leftOffset + colWidth - container.clientWidth;
            }
          }
          break;

        case 'ArrowLeft':
          e.preventDefault();
          if (col > 0) {
            const nextCol = col - 1;
            onFocusedCellChange({ row, col: nextCol });
            let leftOffset = 44;
            for (let i = 0; i < nextCol; i++) {
              leftOffset += columnWidths[columns[i].key] ?? columns[i].width;
            }
            const container = scrollContainerRef.current;
            if (container && leftOffset < container.scrollLeft) {
              container.scrollLeft = leftOffset;
            }
          }
          break;

        case ' ':
          e.preventDefault();
          if (orders[row]) {
            onRowSelect(orders[row].id, false);
          }
          break;

        case 'Enter':
          e.preventDefault();
          if (orders[row]) {
            onOpenDetail(orders[row]);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    focusedCell,
    orders,
    columns,
    columnWidths,
    scrollTop,
    viewportHeight,
    onFocusedCellChange,
    onRowSelect,
    onOpenDetail,
  ]);

  return (
    <div className="flex flex-col h-full border border-slate-200 rounded-md bg-white overflow-hidden shadow-xs">
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        tabIndex={0}
        role="grid"
        aria-rowcount={orders.length + 1}
        aria-colcount={columns.length + 1}
        className="flex-1 overflow-auto outline-none focus:ring-1 focus:ring-blue-500/50"
      >
        <div style={{ minWidth: `${totalWidth}px` }}>
          {/* Sticky Header */}
          <GridHeader
            columns={columns}
            columnWidths={columnWidths}
            sort={sort}
            pinnedColumn={pinnedColumn}
            onSort={onSort}
            onResize={onColumnResize}
            onPin={onPin}
            isAllSelected={isAllSelected}
            onToggleSelectAll={onToggleSelectAll}
          />

          {/* Virtual Scrolling Body */}
          <div style={{ height: `${totalHeight}px`, position: 'relative' }}>
            {visibleOrders.map((order, i) => {
              const actualIndex = startIndex + i;
              const isSelected = selectedIds.has(order.id);

              return (
                <GridRow
                  key={order.id}
                  order={order}
                  columns={columns}
                  columnWidths={columnWidths}
                  isSelected={isSelected}
                  focusedCell={focusedCell}
                  rowIndex={actualIndex}
                  pinnedColumn={pinnedColumn}
                  onRowClick={onRowSelect}
                  onRowDoubleClick={onOpenDetail}
                  onCellClick={handleCellClick}
                  style={{
                    position: 'absolute',
                    top: `${actualIndex * ROW_HEIGHT}px`,
                    width: '100%',
                    height: `${ROW_HEIGHT}px`,
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
