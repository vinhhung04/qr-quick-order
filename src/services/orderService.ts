import { supabase } from "../lib/supabase";
import type { CartLine } from "../types/order";
import type { OrderItemRow, OrderRow } from "../types/database";
import type { OrderWithItems } from "../types/order";

export interface CreateOrderInput {
  tableId: string;
  note: string;
  lines: CartLine[];
}

/**
 * Creates an order plus its order_items in two inserts. item_name/price are
 * snapshotted from the cart so later menu edits don't rewrite order history.
 */
export async function createOrder({ tableId, note, lines }: CreateOrderInput): Promise<string> {
  if (lines.length === 0) {
    throw new Error("Giỏ hàng đang trống.");
  }

  const totalAmount = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({ table_id: tableId, total_amount: totalAmount, note: note || null })
    .select()
    .single();

  if (orderError || !order) {
    console.error("createOrder failed:", orderError?.message);
    throw new Error(orderError?.message ?? "Không thể tạo order.");
  }

  const orderItems = lines.map((line) => ({
    order_id: order.id,
    menu_item_id: line.menuItemId,
    item_name: line.name,
    price: line.price,
    quantity: line.quantity,
    note: line.note || null,
  }));

  const { error: itemsError } = await supabase.from("order_items").insert(orderItems);

  if (itemsError) {
    console.error("createOrder items failed:", itemsError.message);
    throw new Error(itemsError.message);
  }

  return order.id as string;
}

interface OrderRowWithTable extends OrderRow {
  tables: { table_number: number; label: string | null } | null;
}

/** Fetches order_items for the given orders and merges them into `OrderWithItems`. */
async function attachItems(safeOrders: OrderRowWithTable[], errorLabel: string): Promise<OrderWithItems[]> {
  if (safeOrders.length === 0) return [];

  const orderIds = safeOrders.map((order) => order.id);
  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("*")
    .in("order_id", orderIds);

  if (itemsError) {
    console.error(`${errorLabel} items failed:`, itemsError.message);
  }

  const safeItems = (items ?? []) as OrderItemRow[];

  return safeOrders.map((order) => ({
    ...order,
    table_number: order.tables?.table_number ?? 0,
    table_label: order.tables?.label ?? null,
    items: safeItems.filter((item) => item.order_id === order.id),
  }));
}

export async function getRecentOrders(limit = 30): Promise<OrderWithItems[]> {
  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("*, tables ( table_number, label )")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (ordersError) {
    console.error("getRecentOrders failed:", ordersError.message);
    return [];
  }

  return attachItems((orders ?? []) as OrderRowWithTable[], "getRecentOrders");
}

/**
 * Fetches every order created within `[startIso, endIso)`, oldest first — used by
 * the staff history view to list/group a day's orders by time slot.
 */
export async function getOrdersInRange(startIso: string, endIso: string): Promise<OrderWithItems[]> {
  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("*, tables ( table_number, label )")
    .gte("created_at", startIso)
    .lt("created_at", endIso)
    .order("created_at", { ascending: true });

  if (ordersError) {
    console.error("getOrdersInRange failed:", ordersError.message);
    return [];
  }

  return attachItems((orders ?? []) as OrderRowWithTable[], "getOrdersInRange");
}

export async function getOrderWithItems(orderId: string): Promise<OrderWithItems | null> {
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*, tables ( table_number, label )")
    .eq("id", orderId)
    .maybeSingle();

  if (orderError || !order) {
    console.error("getOrderWithItems failed:", orderError?.message);
    return null;
  }

  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", orderId);

  if (itemsError) {
    console.error("getOrderWithItems items failed:", itemsError.message);
  }

  const typedOrder = order as OrderRowWithTable;

  return {
    ...typedOrder,
    table_number: typedOrder.tables?.table_number ?? 0,
    table_label: typedOrder.tables?.label ?? null,
    items: (items ?? []) as OrderItemRow[],
  };
}
