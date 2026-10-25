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
    width: 130,
    minWidth: 90,
    type: 'text',
    align: 'center',
  },
  {
    key: 'customerName',
    label: 'Customer',
    width: 160,
    minWidth: 110,
    type: 'text',
    align: 'center',
  },
  {
    key: 'customerEmail',
    label: 'Customer Email',
    width: 230,
    minWidth: 140,
    type: 'text',
    align: 'center',
  },
  {
    key: 'status',
    label: 'Status',
    width: 120,
    minWidth: 90,
    type: 'enum',
    align: 'center',
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
    label: 'Created At',
    width: 170,
    minWidth: 130,
    type: 'date',
    align: 'center',
  },
  {
    key: 'updatedAt',
    label: 'Updated At',
    width: 170,
    minWidth: 130,
    type: 'date',
    align: 'center',
  },
  {
    key: 'region',
    label: 'Region',
    width: 110,
    minWidth: 80,
    type: 'enum',
    align: 'center',
    enumValues: ['north', 'south', 'east', 'west', 'central', 'northeast'],
  },
  {
    key: 'channel',
    label: 'Channel',
    width: 100,
    minWidth: 80,
    type: 'enum',
    align: 'center',
    enumValues: ['web', 'app', 'phone', 'store'],
  },
  {
    key: 'priority',
    label: 'Priority',
    width: 90,
    minWidth: 70,
    type: 'enum',
    align: 'center',
    enumValues: ['1', '2', '3', 'null'],
  },
  {
    key: 'paymentMethod',
    label: 'Payment Method',
    width: 130,
    minWidth: 90,
    type: 'enum',
    align: 'center',
    enumValues: ['upi', 'card', 'netbanking', 'cod', 'wallet'],
  },
  {
    key: 'itemCount',
    label: 'Items',
    width: 80,
    minWidth: 60,
    type: 'number',
    align: 'center',
  },
  {
    key: 'notes',
    label: 'Notes',
    width: 220,
    minWidth: 120,
    type: 'text',
    align: 'left',
  },
];
