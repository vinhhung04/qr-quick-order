import type { OrderItemRow, OrderRow } from "./database";

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
  items: OrderItemRow[];
}
