// ── Raw order shape from orders.json ──────────────────────────────
export interface RawOrder {
  id: string;
  schemaVersion: 1 | 2;
  customerName?: string;
  customer_name?: string;
  customerEmail: string;
  status: string;
  amount: number | string;
  currency: string;
  createdAt: string | number;
  updatedAt?: string | null;
  region: string;
  channel: string;
  priority?: number | null;
  paymentMethod: string;
  itemCount: number;
  notes?: string | null;
}

// ── Normalized order after cleaning ──────────────────────────────
export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  status: OrderStatus;
  amount: number; // always in rupees
  currency: string;
  createdAt: Date;
  updatedAt: Date | null;
  region: OrderRegion;
  channel: OrderChannel;
  priority: OrderPriority;
  paymentMethod: OrderPaymentMethod;
  itemCount: number;
  notes: string;
}

// ── Enum-like types for categorical fields ───────────────────────
export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type OrderRegion =
  | 'north'
  | 'south'
  | 'east'
  | 'west'
  | 'central'
  | 'northeast';

export type OrderChannel = 'web' | 'app' | 'phone' | 'store';

export type OrderPaymentMethod =
  | 'upi'
  | 'card'
  | 'netbanking'
  | 'cod'
  | 'wallet';

export type OrderPriority = 1 | 2 | 3 | null;

// ── Column definition ────────────────────────────────────────────
export type ColumnKey = keyof Order;

export interface ColumnDef {
  key: ColumnKey;
  label: string;
  width: number;
  minWidth: number;
  type: 'text' | 'number' | 'date' | 'enum';
  align: 'left' | 'right';
  enumValues?: string[];
}

// ── Sort state ───────────────────────────────────────────────────
export type SortDirection = 'asc' | 'desc';

export interface SortState {
  column: ColumnKey;
  direction: SortDirection;
}

// ── Filter types ─────────────────────────────────────────────────
export type TextOperator = 'contains' | 'does_not_contain' | 'equals';
export type NumberOperator = 'eq' | 'gt' | 'lt' | 'between';
export type DateOperator = 'before' | 'after' | 'between';
export type EnumOperator = 'is_one_of';

export type FilterOperator =
  | TextOperator
  | NumberOperator
  | DateOperator
  | EnumOperator;

export interface FilterCondition {
  id: string;
  field: ColumnKey;
  operator: FilterOperator;
  value: string; // serialized: single value, comma-separated, or "min,max" for between
}

export interface FilterGroup {
  id: string;
  conditions: FilterCondition[]; // joined with OR
}

// Groups are joined with AND
export type FilterState = FilterGroup[];
