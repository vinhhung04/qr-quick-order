import { supabase } from "../lib/supabase";
import type { TableRow } from "../types/database";

export async function getTableByToken(qrToken: string): Promise<TableRow | null> {
  const { data, error } = await supabase
    .from("tables")
    .select("*")
    .eq("qr_token", qrToken)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    console.error("getTableByToken failed:", error.message);
    return null;
  }

  return data;
}

export async function getAllTables(): Promise<TableRow[]> {
  const { data, error } = await supabase
    .from("tables")
    .select("*")
    .order("table_number", { ascending: true });

  if (error) {
    console.error("getAllTables failed:", error.message);
    return [];
  }

  return data ?? [];
}

export async function createTable(
  tableNumber: number,
  qrToken: string,
  label?: string | null
): Promise<TableRow | null> {
  const { data, error } = await supabase
    .from("tables")
    .insert({ table_number: tableNumber, qr_token: qrToken, label: label || null, is_active: true })
    .select()
    .single();

  if (error) {
    console.error("createTable failed:", error.message);
    throw new Error(error.message);
  }

  return data;
}

export async function setTableActive(id: string, isActive: boolean): Promise<void> {
  const { error } = await supabase.from("tables").update({ is_active: isActive }).eq("id", id);

  if (error) {
    console.error("setTableActive failed:", error.message);
    throw new Error(error.message);
  }
}
