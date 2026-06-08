import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import type { CartLine } from "../types/order";
import type { MenuItem } from "../types/menu";
import { CartContext, type CartContextValue } from "./cartContextValue";

function storageKey(qrToken: string) {
  return `qr-quick-order:cart:${qrToken}`;
}

export function CartProvider({ qrToken, children }: { qrToken: string; children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(() => {
    try {
      const raw = localStorage.getItem(storageKey(qrToken));
      return raw ? (JSON.parse(raw) as CartLine[]) : [];
    } catch {
      return [];
    }
  });
  const [generalNote, setGeneralNote] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(storageKey(qrToken), JSON.stringify(lines));
    } catch {
      // localStorage unavailable (e.g. private browsing) — cart just won't persist.
    }
  }, [lines, qrToken]);

  const addItem = useCallback((item: MenuItem) => {
    setLines((prev) => {
      const existing = prev.find((line) => line.menuItemId === item.id);
      if (existing) {
        return prev.map((line) =>
          line.menuItemId === item.id ? { ...line, quantity: line.quantity + 1 } : line
        );
      }
      return [
        ...prev,
        {
          menuItemId: item.id,
          name: item.name,
          price: item.price,
          imageUrl: item.image_url,
          quantity: 1,
          note: "",
        },
      ];
    });
  }, []);

  const incrementLine = useCallback((menuItemId: string) => {
    setLines((prev) =>
      prev.map((line) =>
        line.menuItemId === menuItemId ? { ...line, quantity: line.quantity + 1 } : line
      )
    );
  }, []);

  const decrementLine = useCallback((menuItemId: string) => {
    setLines((prev) =>
      prev
        .map((line) =>
          line.menuItemId === menuItemId ? { ...line, quantity: line.quantity - 1 } : line
        )
        .filter((line) => line.quantity > 0)
    );
  }, []);

  const removeLine = useCallback((menuItemId: string) => {
    setLines((prev) => prev.filter((line) => line.menuItemId !== menuItemId));
  }, []);

  const setLineNote = useCallback((menuItemId: string, note: string) => {
    setLines((prev) =>
      prev.map((line) => (line.menuItemId === menuItemId ? { ...line, note } : line))
    );
  }, []);

  const clearCart = useCallback(() => {
    setLines([]);
    setGeneralNote("");
  }, []);

  const itemCount = useMemo(() => lines.reduce((sum, line) => sum + line.quantity, 0), [lines]);
  const totalAmount = useMemo(
    () => lines.reduce((sum, line) => sum + line.price * line.quantity, 0),
    [lines]
  );

  const value: CartContextValue = {
    lines,
    generalNote,
    itemCount,
    totalAmount,
    addItem,
    incrementLine,
    decrementLine,
    removeLine,
    setLineNote,
    setGeneralNote,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
