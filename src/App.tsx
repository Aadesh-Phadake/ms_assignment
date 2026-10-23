import { useState, useCallback, useRef, useMemo } from 'react';
import type { Order, ColumnKey, SortState, SortDirection, FilterState } from './types';
import { useOrders } from './hooks/useOrders';
import { useFilteredOrders } from './hooks/useFilteredOrders';
import { useSelection } from './hooks/useSelection';
import { COLUMNS, exportToCSV } from './utils';
import { DataGrid } from './components/Grid';
import { EmptyState } from './components/common/EmptyState';
import { StatusBar } from './components/common/StatusBar';
import { Loader2 } from 'lucide-react';

function App() {
  const { orders, loading, error, totalCount } = useOrders();

  // Sort state
  const [sort, setSort] = useState<SortState | null>(null);

  // Filter state (to be built in Day 2)
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
        {/* Left panel placeholder for filter builder (Day 2) */}
        <aside className="w-72 border-r border-slate-200 bg-white p-3 shrink-0 overflow-y-auto">
          <h2 className="text-sm font-bold text-slate-800 mb-1">Filter Builder</h2>
          <p className="text-xs text-slate-500 mb-4">Narrow orders by criteria</p>
          <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center">
            <p className="text-xs text-slate-400">Filter builder coming soon</p>
          </div>
        </aside>

        {/* Grid area */}
        <main className="flex-1 flex flex-col gap-1.5 p-2 overflow-hidden">
          {/* Filter chips placeholder (Day 2) */}

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
          <aside className="w-80 border-l border-slate-200 bg-white p-4 shrink-0 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-800">Order Details</h2>
              <button
                onClick={() => setDetailOrder(null)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 text-xs">
              {Object.entries(detailOrder).map(([key, value]) => (
                <div key={key} className="border-b border-slate-100 pb-2">
                  <dt className="font-semibold text-slate-500 uppercase tracking-wider text-[10px] mb-0.5">
                    {key}
                  </dt>
                  <dd className="text-slate-800 break-words">
                    {value instanceof Date
                      ? value.toISOString()
                      : value === null
                        ? '—'
                        : String(value)}
                  </dd>
                </div>
              ))}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

export default App;
