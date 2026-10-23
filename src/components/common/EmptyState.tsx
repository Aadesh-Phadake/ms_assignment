import React from 'react';
import { SearchX } from 'lucide-react';

interface EmptyStateProps {
  totalCount: number;
  onClearFilters: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ totalCount, onClearFilters }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-white border border-slate-200 rounded-md">
      <div className="flex flex-col items-center gap-3 text-center px-8">
        <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center">
          <SearchX className="w-7 h-7 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-800">
          No orders match your filters
        </h3>
        <p className="text-sm text-slate-500 max-w-sm">
          None of the {totalCount.toLocaleString('en-IN')} orders match the current filter criteria.
          Try adjusting your conditions or clear all filters.
        </p>
        <button
          onClick={onClearFilters}
          className="mt-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Clear all filters
        </button>
      </div>
    </div>
  );
};
