/**
 * OrderDetail.tsx
 *
 * Side panel showing full details of a focused order.
 * Opened with Enter key or row double-click.
 */

import React, { useEffect } from 'react';
import type { Order } from '../../types';
import {
  formatINR,
  formatDate,
  formatStatus,
  formatRegion,
  formatChannel,
  formatPaymentMethod,
  formatPriority,
} from '../../utils';
import { X, Package } from 'lucide-react';

interface OrderDetailProps {
  order: Order;
  onClose: () => void;
}

const statusColors: Record<string, string> = {
  delivered: 'bg-emerald-100 text-emerald-800',
  shipped: 'bg-blue-100 text-blue-800',
  processing: 'bg-amber-100 text-amber-800',
  pending: 'bg-orange-100 text-orange-800',
  cancelled: 'bg-rose-100 text-rose-800',
};

interface DetailRowProps {
  label: string;
  value: React.ReactNode;
}

const DetailRow: React.FC<DetailRowProps> = ({ label, value }) => (
  <div className="flex justify-between items-start py-1.5 border-b border-slate-50">
    <dt className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider shrink-0 w-24">
      {label}
    </dt>
    <dd className="text-xs text-slate-800 text-right break-words ml-2 flex-1">{value}</dd>
  </div>
);

export const OrderDetail: React.FC<OrderDetailProps> = ({ order, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <aside className="w-80 border-l border-slate-200 bg-white shrink-0 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-slate-500" />
          <h2 className="text-sm font-bold text-slate-800">Order Details</h2>
        </div>
        <button
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
          title="Close (Esc)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {/* Order ID badge */}
        <div className="flex items-center gap-2 mb-3">
          <span className="font-mono text-sm font-bold text-slate-900">{order.id}</span>
          <span
            className={`px-2 py-0.5 text-[11px] font-semibold rounded ${
              statusColors[order.status] || 'bg-slate-100 text-slate-700'
            }`}
          >
            {formatStatus(order.status)}
          </span>
        </div>

        {/* Details */}
        <div className="space-y-0">
          <DetailRow label="Customer" value={order.customerName} />
          <DetailRow label="Email" value={order.customerEmail} />
          <DetailRow label="Amount" value={<span className="font-mono font-medium">{formatINR(order.amount)}</span>} />
          <DetailRow label="Items" value={order.itemCount} />
          <DetailRow label="Priority" value={formatPriority(order.priority)} />
          <DetailRow label="Region" value={formatRegion(order.region)} />
          <DetailRow label="Channel" value={formatChannel(order.channel)} />
          <DetailRow label="Payment" value={formatPaymentMethod(order.paymentMethod)} />
          <DetailRow label="Created" value={formatDate(order.createdAt)} />
          <DetailRow label="Updated" value={formatDate(order.updatedAt)} />
          <DetailRow label="Currency" value={order.currency} />
        </div>

        {/* Notes section */}
        <div className="mt-3">
          <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Notes
          </h3>
          <div className="p-2 bg-slate-50 rounded text-xs text-slate-700 min-h-[40px] whitespace-pre-wrap break-words">
            {order.notes || <span className="text-slate-400 italic">No notes</span>}
          </div>
        </div>
      </div>
    </aside>
  );
};
