/**
 * csvExport.ts
 *
 * Exports selected orders to a CSV file download.
 */

import type { Order } from '../types';
import { formatINR, formatDate, formatStatus, formatRegion, formatChannel, formatPaymentMethod, formatPriority } from './formatters';

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return '"' + value.replace(/"/g, '""') + '"';
  }
  return value;
}

export function exportToCSV(orders: Order[], filename = 'orders-export.csv'): void {
  const headers = [
    'ID', 'Customer Name', 'Email', 'Status', 'Amount', 'Currency',
    'Created At', 'Updated At', 'Region', 'Channel', 'Priority',
    'Payment Method', 'Item Count', 'Notes',
  ];

  const rows = orders.map((order) => [
    order.id,
    order.customerName,
    order.customerEmail,
    formatStatus(order.status),
    formatINR(order.amount),
    order.currency,
    formatDate(order.createdAt),
    formatDate(order.updatedAt),
    formatRegion(order.region),
    formatChannel(order.channel),
    formatPriority(order.priority),
    formatPaymentMethod(order.paymentMethod),
    String(order.itemCount),
    order.notes,
  ]);

  const csvContent =
    headers.map(escapeCSV).join(',') +
    '\n' +
    rows.map((row) => row.map(escapeCSV).join(',')).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
