import type { OrderWithItems } from "../../types/order";
import { formatRelativeTime, formatVND, getTableLabel, cn } from "../../lib/utils";

interface StaffOrderCardProps {
  order: OrderWithItems;
  highlight?: boolean;
}

export function StaffOrderCard({ order, highlight }: StaffOrderCardProps) {
  return (
    <article
      className={cn(
        "flex flex-col gap-3 rounded-3xl bg-white p-5 shadow-md shadow-stone-200/60 ring-1 ring-stone-100 transition",
        highlight && "ring-2 ring-brand-400 animate-glow"
      )}
    >
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-2 rounded-2xl bg-stone-900 px-3.5 py-2 text-sm font-extrabold text-white">
          🍽️ {getTableLabel({ table_number: order.table_number, label: order.table_label })}
        </span>
        <span className="text-xs font-medium text-stone-400">{formatRelativeTime(order.created_at)}</span>
      </div>

      <ul className="flex flex-col gap-2">
        {order.items.map((item) => (
          <li key={item.id} className="flex items-start justify-between gap-3 rounded-xl bg-stone-50 px-3 py-2">
            <div>
              <p className="text-sm font-semibold text-stone-800">
                <span className="mr-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-md bg-brand-500 px-1 text-xs font-bold text-white">
                  {item.quantity}
                </span>
                {item.item_name}
              </p>
              {item.note && <p className="mt-0.5 pl-7 text-xs italic text-stone-500">📝 {item.note}</p>}
            </div>
            <span className="shrink-0 text-sm font-semibold text-stone-600">
              {formatVND(item.price * item.quantity)}
            </span>
          </li>
        ))}
      </ul>

      {order.note && (
        <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">
          <span className="font-semibold">Ghi chú chung: </span>
          {order.note}
        </p>
      )}

      <div className="flex items-center justify-between border-t border-stone-100 pt-3">
        <span className="text-sm font-medium text-stone-500">Tổng tiền</span>
        <span className="text-lg font-extrabold text-brand-600">{formatVND(order.total_amount)}</span>
      </div>
    </article>
  );
}
