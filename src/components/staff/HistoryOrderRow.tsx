import { useState } from "react";
import type { OrderWithItems } from "../../types/order";
import { cn, formatVND, getTableLabel } from "../../lib/utils";

interface HistoryOrderRowProps {
  order: OrderWithItems;
}

function formatTime(isoDate: string): string {
  return new Date(isoDate).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

/** Collapsible row summarizing one past order — expands to show its items. */
export function HistoryOrderRow({ order }: HistoryOrderRowProps) {
  const [open, setOpen] = useState(false);
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="rounded-2xl bg-stone-50 ring-1 ring-stone-100">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="rounded-xl bg-stone-900 px-2.5 py-1.5 text-xs font-bold text-white">
            {formatTime(order.created_at)}
          </span>
          <div>
            <p className="text-sm font-bold text-stone-800">
              {getTableLabel({ table_number: order.table_number, label: order.table_label })}
            </p>
            <p className="text-xs text-stone-500">{itemCount} món</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-sm font-extrabold text-brand-600">{formatVND(order.total_amount)}</span>
          <span className={cn("text-stone-400 transition-transform", open && "rotate-180")}>⌄</span>
        </div>
      </button>

      {open && (
        <div className="flex flex-col gap-2 border-t border-stone-100 px-4 pb-4 pt-3">
          <ul className="flex flex-col gap-1.5">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-start justify-between gap-3 text-sm">
                <span className="text-stone-700">
                  <span className="mr-1.5 font-bold text-stone-500">{item.quantity}×</span>
                  {item.item_name}
                  {item.note && <span className="ml-1.5 italic text-stone-400">({item.note})</span>}
                </span>
                <span className="shrink-0 font-medium text-stone-500">
                  {formatVND(item.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          {order.note && (
            <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
              <span className="font-semibold">Ghi chú: </span>
              {order.note}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
