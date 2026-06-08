import { useState } from "react";
import { useCart } from "../../context/useCart";
import { BottomSheet } from "../ui/BottomSheet";
import { Button } from "../ui/Button";
import { CartItem } from "./CartItem";
import { formatVND } from "../../lib/utils";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => Promise<void> | void;
  submitting: boolean;
}

export function CartDrawer({ open, onClose, onSubmit, submitting }: CartDrawerProps) {
  const {
    lines,
    generalNote,
    totalAmount,
    incrementLine,
    decrementLine,
    removeLine,
    setLineNote,
    setGeneralNote,
  } = useCart();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (lines.length === 0) {
      setError("Giỏ hàng đang trống. Hãy chọn ít nhất một món nhé!");
      return;
    }
    setError(null);
    await onSubmit();
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Giỏ hàng của bạn"
      footer={
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-stone-500">Tổng cộng</span>
            <span className="text-xl font-extrabold text-brand-600">{formatVND(totalAmount)}</span>
          </div>
          {error && <p className="text-sm font-medium text-red-500">{error}</p>}
          <Button
            size="lg"
            className="w-full"
            onClick={handleSubmit}
            disabled={submitting || lines.length === 0}
          >
            {submitting ? "Đang gửi order..." : "Gửi order"}
          </Button>
        </div>
      }
    >
      {lines.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-12 text-center text-stone-400">
          <span className="text-4xl">🛒</span>
          <p className="font-semibold">Giỏ hàng trống</p>
          <p className="text-sm">Hãy thêm món bạn yêu thích vào giỏ nhé!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2.5">
            {lines.map((line) => (
              <CartItem
                key={line.menuItemId}
                line={line}
                onIncrement={() => incrementLine(line.menuItemId)}
                onDecrement={() => decrementLine(line.menuItemId)}
                onRemove={() => removeLine(line.menuItemId)}
                onNoteChange={(note) => setLineNote(line.menuItemId, note)}
              />
            ))}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-stone-700">
              Ghi chú chung cho order
            </label>
            <textarea
              value={generalNote}
              onChange={(e) => setGeneralNote(e.target.value)}
              placeholder="Ví dụ: mang ra cùng lúc, thêm đũa..."
              rows={2}
              className="w-full resize-none rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm text-stone-700 placeholder:text-stone-400 outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
            />
          </div>
        </div>
      )}
    </BottomSheet>
  );
}
