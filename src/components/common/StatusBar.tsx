import React from 'react';
import { Download } from 'lucide-react';

interface StatusBarProps {
  filteredCount: number;
  totalCount: number;
  selectedCount: number;
  onExport: () => void;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  filteredCount,
  totalCount,
  selectedCount,
  onExport,
}) => {
  return (
    <div className="flex items-center justify-between h-9 px-3 bg-white border border-slate-200 rounded-md text-xs">
      <div className="flex items-center gap-4">
        <span className="font-semibold text-slate-800">
          {filteredCount.toLocaleString('en-IN')} of {totalCount.toLocaleString('en-IN')} orders
        </span>
        {selectedCount > 0 && (
          <span className="text-blue-700 font-medium">
            {selectedCount} row{selectedCount !== 1 ? 's' : ''} selected
          </span>
        )}
      </div>
      <button
        onClick={onExport}
        disabled={selectedCount === 0}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors
          disabled:opacity-40 disabled:cursor-not-allowed
          text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <Download className="w-3.5 h-3.5" />
        Export CSV{selectedCount > 0 ? ` (${selectedCount})` : ''}
      </button>
    </div>
  );
};
