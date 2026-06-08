import type { TableRequestWithTable } from "../../types/order";
import { formatRelativeTime, getTableLabel, cn } from "../../lib/utils";

interface RequestBannerProps {
  requests: TableRequestWithTable[];
  highlightedId: string | null;
  onResolve: (request: TableRequestWithTable) => void;
}

const REQUEST_META: Record<TableRequestWithTable["type"], { icon: string; label: string }> = {
  call_staff: { icon: "🔔", label: "Gọi nhân viên" },
  request_bill: { icon: "🧾", label: "Yêu cầu thanh toán" },
};

/** Live banner of pending call-staff / request-bill notifications from tables. */
export function RequestBanner({ requests, highlightedId, onResolve }: RequestBannerProps) {
  if (requests.length === 0) return null;

  return (
    <div className="mb-6 flex flex-col gap-2.5">
      <h2 className="flex items-center gap-2 text-sm font-extrabold text-stone-900">
        📣 Yêu cầu từ khách
        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">
          {requests.length}
        </span>
      </h2>

      {requests.map((request) => {
        const meta = REQUEST_META[request.type];
        return (
          <div
            key={request.id}
            className={cn(
              "flex items-center justify-between gap-3 rounded-2xl bg-amber-50 px-4 py-3 ring-1 ring-amber-200 transition",
              request.id === highlightedId && "ring-2 ring-amber-400 animate-glow"
            )}
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-lg shadow-sm">
                {meta.icon}
              </span>
              <div>
                <p className="text-sm font-bold text-stone-900">
                  {meta.label} — {getTableLabel({ table_number: request.table_number, label: request.table_label })}
                </p>
                <p className="text-xs text-stone-500">{formatRelativeTime(request.created_at)}</p>
              </div>
            </div>
            <button
              onClick={() => onResolve(request)}
              className="shrink-0 rounded-xl bg-stone-900 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-stone-800"
            >
              ✓ Đã xử lý
            </button>
          </div>
        );
      })}
    </div>
  );
}
