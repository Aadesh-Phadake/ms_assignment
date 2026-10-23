import React from 'react';
import type { Order, ColumnDef } from '../../types';
import {
  formatINR,
  formatDate,
  formatStatus,
  formatRegion,
  formatPriority,
  formatChannel,
  formatPaymentMethod,
} from '../../utils';

interface GridCellProps {
  order: Order;
  column: ColumnDef;
  width: number;
  isPinned: boolean;
  isFocused: boolean;
  onCellClick?: () => void;
}

const statusBadgeStyles: Record<string, string> = {
  delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  shipped: 'bg-blue-50 text-blue-700 border-blue-200',
  processing: 'bg-amber-50 text-amber-700 border-amber-200',
  pending: 'bg-orange-50 text-orange-700 border-orange-200',
  cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
};

const priorityBadgeStyles: Record<string, string> = {
  '1': 'bg-rose-50 text-rose-700 border-rose-200 font-semibold',
  '2': 'bg-amber-50 text-amber-700 border-amber-200',
  '3': 'bg-slate-100 text-slate-600 border-slate-200',
  None: 'text-slate-400',
};

export const GridCell: React.FC<GridCellProps> = ({
  order,
  column,
  width,
  isPinned,
  isFocused,
  onCellClick,
}) => {
  const value = order[column.key];

  let content: React.ReactNode = null;

  switch (column.key) {
    case 'id':
      content = <span className="font-mono text-xs font-semibold text-slate-900">{order.id}</span>;
      break;

    case 'status': {
      const style = statusBadgeStyles[order.status] || 'bg-slate-100 text-slate-700 border-slate-200';
      content = (
        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium border leading-none ${style}`}>
          {formatStatus(order.status)}
        </span>
      );
      break;
    }

    case 'amount':
      content = (
        <span className="font-mono text-xs text-slate-900 font-medium">
          {formatINR(order.amount)}
        </span>
      );
      break;

    case 'createdAt':
      content = <span className="text-xs text-slate-600">{formatDate(order.createdAt)}</span>;
      break;

    case 'updatedAt':
      content = <span className="text-xs text-slate-500">{formatDate(order.updatedAt)}</span>;
      break;

    case 'region':
      content = <span className="text-xs text-slate-700">{formatRegion(order.region)}</span>;
      break;

    case 'channel':
      content = <span className="text-xs text-slate-700">{formatChannel(order.channel)}</span>;
      break;

    case 'paymentMethod':
      content = <span className="text-xs text-slate-700">{formatPaymentMethod(order.paymentMethod)}</span>;
      break;

    case 'priority': {
      const formatted = formatPriority(order.priority);
      const style = priorityBadgeStyles[formatted] || '';
      content = (
        <span className={`text-xs px-1.5 py-0.5 rounded ${style}`}>
          {formatted}
        </span>
      );
      break;
    }

    case 'itemCount':
      content = <span className="font-mono text-xs text-slate-700">{order.itemCount}</span>;
      break;

    case 'notes':
      content = (
        <span
          className="text-xs text-slate-600 truncate block max-w-full"
          title={order.notes || 'No notes'}
        >
          {order.notes || <span className="text-slate-300">—</span>}
        </span>
      );
      break;

    default:
      content = (
        <span className="text-xs text-slate-800 truncate block max-w-full" title={String(value ?? '')}>
          {String(value ?? '—')}
        </span>
      );
      break;
  }

  const pinnedClasses = isPinned
    ? 'sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.12)] border-r border-slate-300'
    : 'border-r border-slate-100';

  const focusClasses = isFocused ? 'ring-2 ring-blue-600 ring-inset z-20 bg-blue-50/80' : '';

  return (
    <div
      onClick={onCellClick}
      style={{ width: `${width}px`, minWidth: `${width}px`, maxWidth: `${width}px` }}
      className={`h-8 px-2 flex items-center shrink-0 select-none overflow-hidden ${
        column.align === 'right' ? 'justify-end' : 'justify-start'
      } ${pinnedClasses} ${focusClasses}`}
    >
      {content}
    </div>
  );
};
