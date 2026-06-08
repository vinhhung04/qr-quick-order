import { supabase } from "../lib/supabase";
import type { TableRequestRow } from "../types/database";
import type { TableRequestWithTable } from "../types/order";

export type TableRequestType = TableRequestRow["type"];

/** Sends a "call staff" / "request bill" notification from the customer page. */
export async function createTableRequest(tableId: string, type: TableRequestType): Promise<void> {
  const { error } = await supabase.from("table_requests").insert({ table_id: tableId, type });

  if (error) {
    console.error("createTableRequest failed:", error.message);
    throw new Error("Không thể gửi yêu cầu. Vui lòng thử lại.");
  }
}

interface TableRequestRowWithTable extends TableRequestRow {
  tables: { table_number: number; label: string | null } | null;
}

function mapRequest(row: TableRequestRowWithTable): TableRequestWithTable {
  return {
    ...row,
    table_number: row.tables?.table_number ?? 0,
    table_label: row.tables?.label ?? null,
  };
}

/** Pending requests, oldest first, so staff can handle them in order. */
export async function getPendingRequests(): Promise<TableRequestWithTable[]> {
  const { data, error } = await supabase
    .from("table_requests")
    .select("*, tables ( table_number, label )")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("getPendingRequests failed:", error.message);
    return [];
  }

  return ((data ?? []) as TableRequestRowWithTable[]).map(mapRequest);
}

export async function getTableRequestById(id: string): Promise<TableRequestWithTable | null> {
  const { data, error } = await supabase
    .from("table_requests")
    .select("*, tables ( table_number, label )")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    console.error("getTableRequestById failed:", error?.message);
    return null;
  }

  return mapRequest(data as TableRequestRowWithTable);
}

export async function markTableRequestDone(id: string): Promise<void> {
  const { error } = await supabase.from("table_requests").update({ status: "done" }).eq("id", id);

  if (error) {
    console.error("markTableRequestDone failed:", error.message);
    throw new Error("Không thể cập nhật yêu cầu.");
  }
}
