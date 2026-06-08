import type { CartLine } from "../../types/order";
import { formatVND } from "../../lib/utils";

interface CartItemProps {
  line: CartLine;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
  onNoteChange: (note: string) => void;
}

export function CartItem({ line, onIncrement, onDecrement, onRemove, onNoteChange }: CartItemProps) {
  return (
    <div className="flex gap-3 rounded-2xl bg-stone-50 p-3">
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-stone-200">
        {line.imageUrl ? (
          <img src={line.imageUrl} alt={line.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xl">🍽️</div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-bold text-stone-900">{line.name}</p>
            <p className="text-xs font-semibold text-brand-600">{formatVND(line.price)}</p>
          </div>
          <button
            onClick={onRemove}
            aria-label={`Xóa ${line.name}`}
            className="text-stone-400 transition hover:text-red-500"
          >
            ✕
          </button>
        </div>

        <input
          type="text"
          value={line.note}
          onChange={(e) => onNoteChange(e.target.value)}
          placeholder="Ghi chú cho món này (vd: ít cay, không hành...)"
          className="h-8 w-full rounded-lg border border-stone-200 bg-white px-2.5 text-xs text-stone-600 placeholder:text-stone-400 outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 rounded-full bg-white px-1 py-1 ring-1 ring-stone-200">
            <button
              onClick={onDecrement}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-stone-100 text-stone-600 transition hover:bg-stone-200 active:scale-90"
            >
              −
            </button>
            <span className="w-5 text-center text-sm font-bold text-stone-800">{line.quantity}</span>
            <button
              onClick={onIncrement}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-500 text-white transition hover:bg-brand-600 active:scale-90"
            >
              +
            </button>
          </div>
          <span className="text-sm font-bold text-stone-900">
            {formatVND(line.price * line.quantity)}
          </span>
        </div>
      </div>
    </div>
  );
}
