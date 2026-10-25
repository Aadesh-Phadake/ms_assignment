import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import type { Order, ColumnKey, SortState, SortDirection, FilterState } from './types';
import { useOrders } from './hooks/useOrders';
import { useFilteredOrders } from './hooks/useFilteredOrders';
import { useSelection } from './hooks/useSelection';
import { useUrlState } from './hooks/useUrlState';
import type { UrlSyncState } from './hooks/useUrlState';
import { COLUMNS, exportToCSV } from './utils';
import { DataGrid } from './components/Grid';
import { FilterBuilder } from './components/Filter/FilterBuilder';
import { FilterChips } from './components/Filter/FilterChips';
import { EmptyState } from './components/common/EmptyState';
import { StatusBar } from './components/common/StatusBar';
import { OrderDetail } from './components/Detail/OrderDetail';
import { Loader2, AlertTriangle, X, PanelLeft, Share2, Check } from 'lucide-react';

function App() {
  const { orders, loading, error, totalCount } = useOrders();

  // Sidebar toggle state
  const [isFilterOpen, setIsFilterOpen] = useState(true);

  // Share link copied toast state
  const [copied, setCopied] = useState(false);

  // Sort state
  const [sort, setSort] = useState<SortState | null>(null);

  // Filter state — immediate state for the builder UI
  const [filters, setFilters] = useState<FilterState>([]);

  // Debounced filters — applied to the grid after a short delay
  const [debouncedFilters, setDebouncedFilters] = useState<FilterState>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 150);
    return () => clearTimeout(timer);
  }, [filters]);

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

  // URL error banner
  const [urlErrorMsg, setUrlErrorMsg] = useState<string | null>(null);

  // ── URL State Sync ─────────────────────────────────────────────
  const urlSyncState = useMemo<UrlSyncState>(
    () => ({ sort, pinnedColumn, selectedIds, filters: debouncedFilters }),
    [sort, pinnedColumn, selectedIds, debouncedFilters]
  );

  const handleUrlRestore = useCallback((restored: UrlSyncState) => {
    if (restored.sort) setSort(restored.sort);
    if (restored.pinnedColumn) setPinnedColumn(restored.pinnedColumn);
    if (restored.selectedIds.size > 0) setSelectedIds(restored.selectedIds);
    if (restored.filters.length > 0) {
      setFilters(restored.filters);
      setDebouncedFilters(restored.filters);
    }
  }, []);

  const { urlError } = useUrlState(urlSyncState, handleUrlRestore);

  // Show URL error once
  useEffect(() => {
    if (urlError) setUrlErrorMsg(urlError);
  }, [urlError]);

  // ── Filtered and sorted orders (uses debounced filters) ────────
  const filteredOrders = useFilteredOrders(orders, debouncedFilters, sort);

  // Selection hook
  const selection = useSelection(filteredOrders, selectedIds, setSelectedIds, lastSelectedIndex);

  // Toggle select all visible orders
  const handleToggleSelectAll = useCallback(() => {
    const allFilteredSelected =
      filteredOrders.length > 0 && filteredOrders.every((o) => selectedIds.has(o.id));
    if (allFilteredSelected) {
      setSelectedIds(new Set());
    } else {
      const next = new Set(selectedIds);
      filteredOrders.forEach((o) => next.add(o.id));
      setSelectedIds(next);
    }
  }, [filteredOrders, selectedIds]);

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
    } else if (filteredOrders.length > 0) {
      // If none explicitly selected, export current filtered results
      exportToCSV(filteredOrders);
    }
  }, [selection.selectedOrders, filteredOrders]);

  // Share current URL
  const handleShare = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  // Clear filters handler
  const handleClearFilters = useCallback(() => {
    setFilters([]);
    setDebouncedFilters([]);
  }, []);

  // Remove a single condition from filters
  const handleRemoveCondition = useCallback(
    (groupIndex: number, conditionIndex: number) => {
      const next = filters
        .map((group, gi) => {
          if (gi !== groupIndex) return group;
          return {
            ...group,
            conditions: group.conditions.filter((_, ci) => ci !== conditionIndex),
          };
        })
        .filter((group) => group.conditions.length > 0);
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
            <span className="text-red-500 text-xl font-bold">!</span>
          </div>
          <h3 className="text-lg font-semibold text-slate-800">Failed to load orders</h3>
          <p className="text-sm text-slate-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50 font-sans text-slate-900">
      {/* URL error banner */}
      {urlErrorMsg && (
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border-b border-amber-200 text-xs text-amber-800 shrink-0">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="flex-1">{urlErrorMsg}</span>
          <button
            onClick={() => setUrlErrorMsg(null)}
            className="text-amber-400 hover:text-amber-600 shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Navigation Bar */}
      <header className="flex items-center justify-between h-14 px-4 bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-3">
          {/* Toggle Filter Panel Button */}
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`p-2 rounded-lg border transition-colors cursor-pointer ${
              isFilterOpen
                ? 'bg-blue-50 border-blue-200 text-blue-600'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
            title={isFilterOpen ? 'Hide Filters' : 'Show Filters'}
          >
            <PanelLeft className="w-4 h-4" />
          </button>

          {/* App Logo */}
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-xs">
            <span className="text-white font-bold text-xs tracking-wider">OE</span>
          </div>

          {/* Title & Subtitle */}
          <div>
            <h1 className="text-sm font-bold text-slate-900 leading-tight">Orders Explorer</h1>
            <p className="text-[11px] text-slate-500 font-medium">
              Showing <span className="font-semibold text-slate-700">{filteredOrders.length.toLocaleString('en-IN')}</span> of {totalCount.toLocaleString('en-IN')} orders
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            title="Copy URL with current filters and state"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600">Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Share</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Filter Builder panel (toggleable) */}
        {isFilterOpen && (
          <FilterBuilder filters={filters} onChange={setFilters} />
        )}

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
              onToggleSelectAll={handleToggleSelectAll}
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
