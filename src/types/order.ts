import type { OrderItemRow, OrderRow, TableRequestRow } from "./database";

/** An item the customer has added to their cart, before being submitted. */
export interface CartLine {
  menuItemId: string;
  name: string;
  price: number;
  imageUrl: string | null;
  quantity: number;
  note: string;
}

export interface OrderWithItems extends OrderRow {
  table_number: number;
  table_label: string | null;
  items: OrderItemRow[];
}

export interface TableRequestWithTable extends TableRequestRow {
  table_number: number;
  table_label: string | null;
}
