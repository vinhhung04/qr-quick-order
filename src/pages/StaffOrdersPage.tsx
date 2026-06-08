import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { supabase } from "../lib/supabase";
import { getOrderWithItems, getRecentOrders } from "../services/orderService";
import {
  getPendingRequests,
  getTableRequestById,
  markTableRequestDone,
} from "../services/requestService";
import type { OrderWithItems, TableRequestWithTable } from "../types/order";
import type { OrderRow, TableRequestRow } from "../types/database";
import { StaffOrderCard } from "../components/staff/StaffOrderCard";
import { RequestBanner } from "../components/staff/RequestBanner";
import { EmptyState } from "../components/ui/EmptyState";
import { PageSpinner } from "../components/ui/Spinner";
import { playNotificationSound } from "../lib/notificationSound";
import { getTableLabel } from "../lib/utils";

const REQUEST_TOAST_LABEL: Record<TableRequestWithTable["type"], string> = {
  call_staff: "gọi nhân viên",
  request_bill: "yêu cầu thanh toán",
};

export default function StaffOrdersPage() {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [requests, setRequests] = useState<TableRequestWithTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [highlightedRequestId, setHighlightedRequestId] = useState<string | null>(null);
  const highlightTimeout = useRef<number | null>(null);
  const requestHighlightTimeout = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [recentOrders, pendingRequests] = await Promise.all([getRecentOrders(), getPendingRequests()]);
      if (!cancelled) {
        setOrders(recentOrders);
        setRequests(pendingRequests);
        setLoading(false);
      }
    }

    load();

    const channel = supabase
      .channel("staff-orders")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        async (payload) => {
          const newOrder = payload.new as OrderRow;
          const fullOrder = await getOrderWithItems(newOrder.id);
          if (!fullOrder || cancelled) return;

          setOrders((prev) => [fullOrder, ...prev]);
          setHighlightedId(fullOrder.id);

          toast.success(
            `Có order mới từ ${getTableLabel({ table_number: fullOrder.table_number, label: fullOrder.table_label })}`,
            { icon: "🔔", duration: 4500 }
          );
          playNotificationSound();

          if (highlightTimeout.current) window.clearTimeout(highlightTimeout.current);
          highlightTimeout.current = window.setTimeout(() => setHighlightedId(null), 3200);
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "table_requests" },
        async (payload) => {
          const newRequest = payload.new as TableRequestRow;
          const fullRequest = await getTableRequestById(newRequest.id);
          if (!fullRequest || cancelled) return;

          setRequests((prev) => [...prev, fullRequest]);
          setHighlightedRequestId(fullRequest.id);

          const tableLabel = getTableLabel({ table_number: fullRequest.table_number, label: fullRequest.table_label });
          toast(`${tableLabel} vừa ${REQUEST_TOAST_LABEL[fullRequest.type]}`, {
            icon: fullRequest.type === "call_staff" ? "🔔" : "🧾",
            duration: 5000,
            style: { background: "#fffbeb", color: "#92400e", fontWeight: 600 },
          });
          playNotificationSound();

          if (requestHighlightTimeout.current) window.clearTimeout(requestHighlightTimeout.current);
          requestHighlightTimeout.current = window.setTimeout(() => setHighlightedRequestId(null), 3200);
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      if (highlightTimeout.current) window.clearTimeout(highlightTimeout.current);
      if (requestHighlightTimeout.current) window.clearTimeout(requestHighlightTimeout.current);
      supabase.removeChannel(channel);
    };
  }, []);

  async function handleResolveRequest(request: TableRequestWithTable) {
    setRequests((prev) => prev.filter((item) => item.id !== request.id));
    try {
      await markTableRequestDone(request.id);
    } catch {
      toast.error("Không thể cập nhật yêu cầu, vui lòng thử lại.");
      setRequests((prev) => [...prev, request]);
    }
  }

  return (
    <div className="min-h-svh px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-stone-900">📋 Order realtime</h1>
            <p className="text-sm text-stone-500">Đơn hàng mới sẽ tự động xuất hiện ở đây</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" /> Đang theo dõi
          </span>
        </header>

        {!loading && (
          <RequestBanner requests={requests} highlightedId={highlightedRequestId} onResolve={handleResolveRequest} />
        )}

        {loading ? (
          <PageSpinner label="Đang tải đơn hàng..." />
        ) : orders.length === 0 ? (
          <EmptyState
            icon="🧾"
            title="Chưa có order nào"
            description="Khi khách quét QR và gửi order, đơn hàng sẽ hiện ngay tại đây theo thời gian thực."
          />
        ) : (
          <div className="flex flex-col gap-4">
            {orders.map((order) => (
              <StaffOrderCard key={order.id} order={order} highlight={order.id === highlightedId} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
