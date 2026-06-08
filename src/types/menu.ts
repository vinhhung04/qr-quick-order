import type { CategoryRow, MenuItemRow } from "./database";

export type MenuItem = MenuItemRow;

export type Category = CategoryRow;

export interface MenuSection {
  category: Category;
  items: MenuItem[];
}
