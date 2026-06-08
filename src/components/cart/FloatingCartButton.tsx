import { formatVND } from "../../lib/utils";

interface FloatingCartButtonProps {
  itemCount: number;
  totalAmount: number;
  onClick: () => void;
}

export function FloatingCartButton({ itemCount, totalAmount, onClick }: FloatingCartButtonProps) {
  if (itemCount === 0) return null;

  return (
    <button
      onClick={onClick}
      className="fixed inset-x-4 bottom-5 z-40 mx-auto flex max-w-md items-center justify-between rounded-2xl bg-gradient-to-r from-stone-900 to-stone-800 px-5 py-4 text-white shadow-2xl shadow-stone-900/30 transition active:scale-[0.98] animate-slide-up sm:left-1/2 sm:right-auto sm:w-full sm:-translate-x-1/2"
    >
      <span className="flex items-center gap-2.5 text-sm font-semibold">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500 text-base">
          🛒
        </span>
        {itemCount} món · {formatVND(totalAmount)}
      </span>
      <span className="rounded-xl bg-white/15 px-3 py-1.5 text-sm font-bold">Xem giỏ hàng →</span>
    </button>
  );
}
