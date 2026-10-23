/**
 * columns.ts
 *
 * Column definitions for the data grid.
 */

import type { ColumnDef } from '../types';

export const COLUMNS: ColumnDef[] = [
  {
    key: 'id',
    label: 'Order ID',
    width: 120,
    minWidth: 80,
    type: 'text',
    align: 'left',
  },
  {
    key: 'customerName',
    label: 'Customer',
    width: 160,
    minWidth: 100,
    type: 'text',
    align: 'left',
  },
  {
    key: 'customerEmail',
    label: 'Email',
    width: 200,
    minWidth: 120,
    type: 'text',
    align: 'left',
  },
  {
    key: 'status',
    label: 'Status',
    width: 100,
    minWidth: 80,
    type: 'enum',
    align: 'left',
    enumValues: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
  },
  {
    key: 'amount',
    label: 'Amount',
    width: 130,
    minWidth: 90,
    type: 'number',
    align: 'right',
  },
  {
    key: 'createdAt',
    label: 'Created',
    width: 160,
    minWidth: 120,
    type: 'date',
    align: 'left',
  },
  {
    key: 'updatedAt',
    label: 'Updated',
    width: 160,
    minWidth: 120,
    type: 'date',
    align: 'left',
  },
  {
    key: 'region',
    label: 'Region',
    width: 100,
    minWidth: 80,
    type: 'enum',
    align: 'left',
    enumValues: ['north', 'south', 'east', 'west', 'central', 'northeast'],
  },
  {
    key: 'channel',
    label: 'Channel',
    width: 90,
    minWidth: 70,
    type: 'enum',
    align: 'left',
    enumValues: ['web', 'app', 'phone', 'store'],
  },
  {
    key: 'priority',
    label: 'Priority',
    width: 80,
    minWidth: 60,
    type: 'enum',
    align: 'right',
    enumValues: ['1', '2', '3', 'null'],
  },
  {
    key: 'paymentMethod',
    label: 'Payment',
    width: 110,
    minWidth: 80,
    type: 'enum',
    align: 'left',
    enumValues: ['upi', 'card', 'netbanking', 'cod', 'wallet'],
  },
  {
    key: 'itemCount',
    label: 'Items',
    width: 70,
    minWidth: 50,
    type: 'number',
    align: 'right',
  },
  {
    key: 'notes',
    label: 'Notes',
    width: 200,
    minWidth: 100,
    type: 'text',
    align: 'left',
  },
];
