import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getOrdersInRange } from "../services/orderService";
import type { OrderWithItems } from "../types/order";
import { HistoryOrderRow } from "../components/staff/HistoryOrderRow";
import { EmptyState } from "../components/ui/EmptyState";
import { PageSpinner } from "../components/ui/Spinner";
import { formatVND, getTimeSlot, TIME_SLOTS } from "../lib/utils";

function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function shiftDateInputValue(value: string, deltaDays: number): string {
  const [year, month, day] = value.split("-").map(Number);
  return toDateInputValue(new Date(year, month - 1, day + deltaDays));
}

/** [start of day, start of next day) as ISO strings, in the viewer's local timezone. */
function rangeForDateInput(value: string): { startIso: string; endIso: string } {
  const [year, month, day] = value.split("-").map(Number);
  const start = new Date(year, month - 1, day, 0, 0, 0, 0);
  const end = new Date(year, month - 1, day + 1, 0, 0, 0, 0);
  return { startIso: start.toISOString(), endIso: end.toISOString() };
}

function formatDateLabel(value: string): string {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function StaffHistoryPage() {
  const todayValue = useMemo(() => toDateInputValue(new Date()), []);
  const [dateValue, setDateValue] = useState(todayValue);
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const { startIso, endIso } = rangeForDateInput(dateValue);
      const result = await getOrdersInRange(startIso, endIso);
      if (!cancelled) {
        setOrders(result);
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [dateValue]);

  const groups = useMemo(
    () =>
      TIME_SLOTS.map((slot) => ({
        slot,
        orders: orders.filter((order) => getTimeSlot(order.created_at).id === slot.id),
      })),
    [orders]
  );

  const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);
  const isToday = dateValue === todayValue;

  return (
    <div className="min-h-svh px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <header className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-stone-900">🗓️ Lịch sử gọi món</h1>
            <p className="text-sm text-stone-500">Xem lại order theo ngày, chia theo từng khung giờ</p>
          </div>
          <Link
            to="/staff/orders"
            className="shrink-0 rounded-2xl bg-white px-3.5 py-2 text-xs font-semibold text-stone-600 shadow-sm ring-1 ring-stone-200 transition hover:bg-stone-50"
          >
            ← Order realtime
          </Link>
        </header>

        <div className="mb-6 flex flex-col gap-3 rounded-3xl bg-white p-4 shadow-md shadow-stone-200/60 ring-1 ring-stone-100 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setDateValue((prev) => shiftDateInputValue(prev, -1))}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-100 text-stone-600 transition hover:bg-stone-200"
              aria-label="Ngày trước"
            >
              ‹
            </button>
            <input
              type="date"
              value={dateValue}
              max={todayValue}
              onChange={(event) => event.target.value && setDateValue(event.target.value)}
              className="rounded-xl border border-stone-200 px-3 py-2.5 text-sm font-semibold text-stone-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
            <button
              type="button"
              onClick={() => setDateValue((prev) => shiftDateInputValue(prev, 1))}
              disabled={isToday}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-100 text-stone-600 transition hover:bg-stone-200 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Ngày sau"
            >
              ›
            </button>
          </div>
          {!isToday && (
            <button
              type="button"
              onClick={() => setDateValue(todayValue)}
              className="self-start rounded-xl bg-brand-50 px-3 py-2 text-xs font-bold text-brand-600 transition hover:bg-brand-100 sm:self-auto"
            >
              Về hôm nay
            </button>
          )}
        </div>

        <p className="mb-4 text-sm font-semibold capitalize text-stone-600">{formatDateLabel(dateValue)}</p>

        {loading ? (
          <PageSpinner label="Đang tải lịch sử..." />
        ) : orders.length === 0 ? (
          <EmptyState
            icon="🗒️"
            title="Không có order nào"
            description="Chưa có đơn hàng nào được ghi nhận trong ngày này."
          />
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between rounded-3xl bg-stone-900 px-5 py-4 text-white shadow-md">
              <div>
                <p className="text-xs font-medium text-white/70">Tổng số order</p>
                <p className="text-xl font-extrabold">{orders.length}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-white/70">Tổng doanh thu</p>
                <p className="text-xl font-extrabold text-brand-300">{formatVND(totalRevenue)}</p>
              </div>
            </div>

            <div className="flex flex-col gap-5">
              {groups.map(({ slot, orders: slotOrders }) => {
                const slotRevenue = slotOrders.reduce((sum, order) => sum + order.total_amount, 0);
                return (
                  <section key={slot.id}>
                    <header className="mb-2.5 flex items-center justify-between gap-2">
                      <h2 className="text-sm font-extrabold text-stone-900">
                        {slot.label} <span className="font-medium text-stone-400">· {slot.range}</span>
                      </h2>
                      {slotOrders.length > 0 && (
                        <div className="shrink-0 text-right text-xs">
                          <span className="rounded-full bg-stone-100 px-2.5 py-1 font-bold text-stone-600">
                            {slotOrders.length} order
                          </span>
                          <span className="ml-2 font-semibold text-brand-600">{formatVND(slotRevenue)}</span>
                        </div>
                      )}
                    </header>

                    {slotOrders.length === 0 ? (
                      <p className="rounded-2xl bg-stone-50 px-4 py-3 text-xs text-stone-400 ring-1 ring-stone-100">
                        Không có order trong khung giờ này
                      </p>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {slotOrders.map((order) => (
                          <HistoryOrderRow key={order.id} order={order} />
                        ))}
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
