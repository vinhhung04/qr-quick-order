import { cn } from "../../lib/utils";
import type { TableRequestType } from "../../services/requestService";

interface RequestButtonsProps {
  pending: Set<TableRequestType>;
  onRequest: (type: TableRequestType) => void;
}

const ACTIONS: { type: TableRequestType; label: string; sentLabel: string; icon: string }[] = [
  { type: "call_staff", label: "Gọi nhân viên", sentLabel: "Đã gọi nhân viên", icon: "🔔" },
  { type: "request_bill", label: "Yêu cầu thanh toán", sentLabel: "Đã gửi yêu cầu", icon: "🧾" },
];

/** Quick-action pills letting customers call staff or ask for the bill. */
export function RequestButtons({ pending, onRequest }: RequestButtonsProps) {
  return (
    <div className="flex gap-2.5">
      {ACTIONS.map((action) => {
        const isPending = pending.has(action.type);
        return (
          <button
            key={action.type}
            type="button"
            disabled={isPending}
            onClick={() => onRequest(action.type)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-2xl px-3 py-2.5 text-sm font-semibold shadow-sm ring-1 transition active:scale-[0.98]",
              isPending
                ? "cursor-default bg-emerald-50 text-emerald-700 ring-emerald-200"
                : "bg-white text-stone-700 ring-stone-100 hover:bg-stone-50"
            )}
          >
            <span>{isPending ? "✅" : action.icon}</span>
            {isPending ? action.sentLabel : action.label}
          </button>
        );
      })}
    </div>
  );
}
