import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { supabase } from "../lib/supabase";
import { getOrderWithItems, getRecentOrders } from "../services/orderService";
import type { OrderWithItems } from "../types/order";
import type { OrderRow } from "../types/database";
import { StaffOrderCard } from "../components/staff/StaffOrderCard";
import { EmptyState } from "../components/ui/EmptyState";
import { PageSpinner } from "../components/ui/Spinner";
import { playNotificationSound } from "../lib/notificationSound";

export default function StaffOrdersPage() {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const highlightTimeout = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const recent = await getRecentOrders();
      if (!cancelled) {
        setOrders(recent);
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

          toast.success(`Có order mới từ Bàn ${String(fullOrder.table_number).padStart(2, "0")}`, {
            icon: "🔔",
            duration: 4500,
          });
          playNotificationSound();

          if (highlightTimeout.current) window.clearTimeout(highlightTimeout.current);
          highlightTimeout.current = window.setTimeout(() => setHighlightedId(null), 3200);
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      if (highlightTimeout.current) window.clearTimeout(highlightTimeout.current);
      supabase.removeChannel(channel);
    };
  }, []);

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
