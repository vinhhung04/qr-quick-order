export interface TableRow {
  id: string;
  table_number: number;
  qr_token: string;
  is_active: boolean;
  created_at: string;
}

export interface CategoryRow {
  id: string;
  name: string;
  sort_order: number;
  created_at: string;
}

export interface MenuItemRow {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
  is_popular: boolean;
  is_new: boolean;
  created_at: string;
}

export interface OrderRow {
  id: string;
  table_id: string;
  total_amount: number;
  note: string | null;
  created_at: string;
}

export interface OrderItemRow {
  id: string;
  order_id: string;
  menu_item_id: string | null;
  item_name: string;
  price: number;
  quantity: number;
  note: string | null;
  created_at: string;
}
