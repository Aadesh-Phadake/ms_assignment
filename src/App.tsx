import { useState, useCallback, useRef, useMemo } from 'react';
import type { Order, ColumnKey, SortState, SortDirection, FilterState } from './types';
import { useOrders } from './hooks/useOrders';
import { useFilteredOrders } from './hooks/useFilteredOrders';
import { useSelection } from './hooks/useSelection';
import { COLUMNS, exportToCSV } from './utils';
import { DataGrid } from './components/Grid';
import { FilterBuilder } from './components/Filter/FilterBuilder';
import { FilterChips } from './components/Filter/FilterChips';
import { EmptyState } from './components/common/EmptyState';
import { StatusBar } from './components/common/StatusBar';
import { OrderDetail } from './components/Detail/OrderDetail';
import { Loader2 } from 'lucide-react';

function App() {
  const { orders, loading, error, totalCount } = useOrders();

  // Sort state
  const [sort, setSort] = useState<SortState | null>(null);

  // Filter state
  const [filters, setFilters] = useState<FilterState>([]);

  // Pinned column
  const [pinnedColumn, setPinnedColumn] = useState<ColumnKey | null>(null);

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const lastSelectedIndex = useRef<number | null>(null);

  // Column widths
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    const widths: Record<string, number> = {};
    COLUMNS.forEach((col) => {
      widths[col.key] = col.width;
    });
    return widths;
  });

  // Focused cell for keyboard navigation
  const [focusedCell, setFocusedCell] = useState<{ row: number; col: number } | null>(null);

  // Detail panel
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);

  // Filtered and sorted orders
  const filteredOrders = useFilteredOrders(orders, filters, sort);

  // Selection hook
  const selection = useSelection(filteredOrders, selectedIds, setSelectedIds, lastSelectedIndex);

  // Reorder columns to put pinned column first
  const displayColumns = useMemo(() => {
    if (!pinnedColumn) return COLUMNS;
    const pinned = COLUMNS.find((c) => c.key === pinnedColumn);
    const rest = COLUMNS.filter((c) => c.key !== pinnedColumn);
    return pinned ? [pinned, ...rest] : COLUMNS;
  }, [pinnedColumn]);

  // Sort handler
  const handleSort = useCallback((column: ColumnKey) => {
    setSort((prev) => {
      if (prev?.column === column) {
        const newDir: SortDirection = prev.direction === 'asc' ? 'desc' : 'asc';
        return { column, direction: newDir };
      }
      return { column, direction: 'asc' };
    });
  }, []);

  // Pin handler
  const handlePin = useCallback((column: ColumnKey) => {
    setPinnedColumn((prev) => (prev === column ? null : column));
  }, []);

  // Column resize handler
  const handleColumnResize = useCallback((column: ColumnKey, width: number) => {
    setColumnWidths((prev) => ({ ...prev, [column]: width }));
  }, []);

  // Export handler — exports only visible selected rows (intersection of selection and filter)
  const handleExport = useCallback(() => {
    if (selection.selectedOrders.length > 0) {
      exportToCSV(selection.selectedOrders);
    }
  }, [selection.selectedOrders]);

  // Clear filters handler
  const handleClearFilters = useCallback(() => {
    setFilters([]);
  }, []);

  // Remove a single condition from filters
  const handleRemoveCondition = useCallback(
    (groupIndex: number, conditionIndex: number) => {
      const next = filters.map((group, gi) => {
        if (gi !== groupIndex) return group;
        return {
          ...group,
          conditions: group.conditions.filter((_, ci) => ci !== conditionIndex),
        };
      }).filter((group) => group.conditions.length > 0);
      setFilters(next);
    },
    [filters]
  );

  // Open detail panel
  const handleOpenDetail = useCallback((order: Order) => {
    setDetailOrder(order);
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-sm text-slate-600 font-medium">Loading 50,000 orders...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-center px-6">
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
            <span className="text-red-500 text-xl">!</span>
          </div>
          <h3 className="text-lg font-semibold text-slate-800">Failed to load orders</h3>
          <p className="text-sm text-slate-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="flex items-center justify-between h-12 px-4 bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center">
            <span className="text-white font-bold text-xs">OE</span>
          </div>
          <h1 className="text-sm font-bold text-slate-900">Orders Explorer</h1>
          <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
            Internal
          </span>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Filter Builder panel */}
        <FilterBuilder filters={filters} onChange={setFilters} />

        {/* Grid area */}
        <main className="flex-1 flex flex-col gap-1.5 p-2 overflow-hidden">
          {/* Filter chips */}
          <FilterChips
            filters={filters}
            onRemoveCondition={handleRemoveCondition}
            onClearAll={handleClearFilters}
          />

          {/* Grid or Empty State */}
          {filteredOrders.length === 0 ? (
            <EmptyState totalCount={totalCount} onClearFilters={handleClearFilters} />
          ) : (
            <DataGrid
              orders={filteredOrders}
              columns={displayColumns}
              sort={sort}
              pinnedColumn={pinnedColumn}
              selectedIds={selectedIds}
              onSort={handleSort}
              onPin={handlePin}
              onRowSelect={selection.toggle}
              onOpenDetail={handleOpenDetail}
              focusedCell={focusedCell}
              onFocusedCellChange={setFocusedCell}
              columnWidths={columnWidths}
              onColumnResize={handleColumnResize}
            />
          )}

          {/* Status Bar */}
          <StatusBar
            filteredCount={filteredOrders.length}
            totalCount={totalCount}
            selectedCount={selection.count}
            onExport={handleExport}
          />
        </main>

        {/* Detail panel */}
        {detailOrder && (
          <OrderDetail order={detailOrder} onClose={() => setDetailOrder(null)} />
        )}
      </div>
    </div>
  );
}

export default App;
