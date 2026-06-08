import { useState } from "react";
import type { MenuItem } from "../../types/menu";
import { Badge } from "../ui/Badge";
import { formatVND, cn } from "../../lib/utils";

interface MenuCardProps {
  item: MenuItem;
  onAdd: (item: MenuItem) => void;
}

export function MenuCard({ item, onAdd }: MenuCardProps) {
  const [popping, setPopping] = useState(false);
  const unavailable = !item.is_available;

  function handleAdd() {
    if (unavailable) return;
    onAdd(item);
    setPopping(true);
    window.setTimeout(() => setPopping(false), 320);
  }

  return (
    <div
      className={cn(
        "group relative flex overflow-hidden rounded-3xl bg-white shadow-md shadow-stone-200/60 ring-1 ring-stone-100 transition-all duration-200",
        "hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand-200/40",
        unavailable && "opacity-60 grayscale",
        popping && "animate-pop"
      )}
    >
      <div className="relative h-32 w-32 shrink-0 overflow-hidden sm:h-36 sm:w-36">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-brand-50 text-3xl">🍽️</div>
        )}
        <div className="absolute left-2 top-2 flex flex-col gap-1.5">
          {item.is_popular && <Badge tone="popular">🔥 Bán chạy</Badge>}
          {item.is_new && <Badge tone="new">✨ Món mới</Badge>}
        </div>
        {unavailable && (
          <div className="absolute inset-0 flex items-center justify-center bg-stone-900/40">
            <Badge tone="soldout">Hết hàng</Badge>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between gap-2 p-4">
        <div>
          <h3 className="font-bold text-stone-900 leading-snug">{item.name}</h3>
          {item.description && (
            <p className="mt-0.5 line-clamp-2 text-sm text-stone-500">{item.description}</p>
          )}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-base font-extrabold text-brand-600">{formatVND(item.price)}</span>
          <button
            onClick={handleAdd}
            disabled={unavailable}
            className={cn(
              "flex h-9 items-center gap-1 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-3.5 text-sm font-bold text-white shadow-md shadow-brand-500/30 transition active:scale-90",
              "disabled:cursor-not-allowed disabled:bg-none disabled:bg-stone-300 disabled:shadow-none"
            )}
          >
            <span className="text-base leading-none">+</span> Thêm
          </button>
        </div>
      </div>
    </div>
  );
}
