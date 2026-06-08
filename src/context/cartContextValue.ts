import { createContext } from "react";
import type { CartLine } from "../types/order";
import type { MenuItem } from "../types/menu";

export interface CartContextValue {
  lines: CartLine[];
  generalNote: string;
  itemCount: number;
  totalAmount: number;
  addItem: (item: MenuItem) => void;
  incrementLine: (menuItemId: string) => void;
  decrementLine: (menuItemId: string) => void;
  removeLine: (menuItemId: string) => void;
  setLineNote: (menuItemId: string, note: string) => void;
  setGeneralNote: (note: string) => void;
  clearCart: () => void;
}

export const CartContext = createContext<CartContextValue | null>(null);
