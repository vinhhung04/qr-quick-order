import { supabase } from "../lib/supabase";
import type { CategoryRow, MenuItemRow } from "../types/database";
import type { MenuSection } from "../types/menu";

export async function getMenu(): Promise<MenuSection[]> {
  const [{ data: categories, error: categoriesError }, { data: items, error: itemsError }] =
    await Promise.all([
      supabase.from("categories").select("*").order("sort_order", { ascending: true }),
      supabase.from("menu_items").select("*").order("created_at", { ascending: true }),
    ]);

  if (categoriesError) console.error("getMenu categories failed:", categoriesError.message);
  if (itemsError) console.error("getMenu items failed:", itemsError.message);

  const safeCategories = categories ?? [];
  const safeItems = items ?? [];

  return safeCategories.map((category) => ({
    category,
    items: safeItems.filter((item) => item.category_id === category.id),
  }));
}

export async function getCategories(): Promise<CategoryRow[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("getCategories failed:", error.message);
    return [];
  }

  return data ?? [];
}

export interface MenuItemInput {
  category_id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  is_available: boolean;
  is_popular: boolean;
  is_new: boolean;
}

export async function createMenuItem(input: MenuItemInput): Promise<MenuItemRow> {
  const { data, error } = await supabase.from("menu_items").insert(input).select().single();

  if (error) {
    console.error("createMenuItem failed:", error.message);
    throw new Error(error.message);
  }

  return data;
}

export async function updateMenuItem(id: string, input: Partial<MenuItemInput>): Promise<MenuItemRow> {
  const { data, error } = await supabase
    .from("menu_items")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("updateMenuItem failed:", error.message);
    throw new Error(error.message);
  }

  return data;
}

export async function deleteMenuItem(id: string): Promise<void> {
  const { error } = await supabase.from("menu_items").delete().eq("id", id);

  if (error) {
    console.error("deleteMenuItem failed:", error.message);
    throw new Error(error.message);
  }
}

export async function setMenuItemAvailability(id: string, isAvailable: boolean): Promise<void> {
  const { error } = await supabase
    .from("menu_items")
    .update({ is_available: isAvailable })
    .eq("id", id);

  if (error) {
    console.error("setMenuItemAvailability failed:", error.message);
    throw new Error(error.message);
  }
}

export async function createCategory(name: string, sortOrder: number): Promise<CategoryRow> {
  const { data, error } = await supabase
    .from("categories")
    .insert({ name, sort_order: sortOrder })
    .select()
    .single();

  if (error) {
    console.error("createCategory failed:", error.message);
    throw new Error(error.message);
  }

  return data;
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase.from("categories").delete().eq("id", id);

  if (error) {
    console.error("deleteCategory failed:", error.message);
    throw new Error(error.message);
  }
}
