import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { CartProvider } from "../context/CartContext";
import { useCart } from "../context/useCart";
import { getMenu } from "../services/menuService";
import { getTableByToken } from "../services/tableService";
import { createOrder } from "../services/orderService";
import { createTableRequest, type TableRequestType } from "../services/requestService";
import type { TableRow } from "../types/database";
import type { MenuItem, MenuSection } from "../types/menu";
import { MenuCard } from "../components/menu/MenuCard";
import { CategoryFilter } from "../components/menu/CategoryFilter";
import { SearchBar } from "../components/menu/SearchBar";
import { RequestButtons } from "../components/order/RequestButtons";
import { FloatingCartButton } from "../components/cart/FloatingCartButton";
import { CartDrawer } from "../components/cart/CartDrawer";
import { OrderSuccessModal } from "../components/cart/OrderSuccessModal";
import { EmptyState } from "../components/ui/EmptyState";
import { PageSpinner } from "../components/ui/Spinner";
import { getTableLabel } from "../lib/utils";

type LoadState = "loading" | "ready" | "not-found" | "error";

export default function OrderPage() {
  const { qrToken } = useParams<{ qrToken: string }>();

  if (!qrToken) return null;

  return (
    <CartProvider qrToken={qrToken}>
      <OrderPageContent qrToken={qrToken} />
    </CartProvider>
  );
}

function OrderPageContent({ qrToken }: { qrToken: string }) {
  const [state, setState] = useState<LoadState>("loading");
  const [table, setTable] = useState<TableRow | null>(null);
  const [menu, setMenu] = useState<MenuSection[]>([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<Set<TableRequestType>>(() => new Set());

  const cart = useCart();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setState("loading");
      try {
        const foundTable = await getTableByToken(qrToken);
        if (cancelled) return;

        if (!foundTable) {
          setState("not-found");
          return;
        }

        setTable(foundTable);
        const sections = await getMenu();
        if (cancelled) return;

        setMenu(sections);
        setState("ready");
      } catch (err) {
        console.error(err);
        if (!cancelled) setState("error");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [qrToken]);

  const filteredSections = useMemo(() => {
    const term = search.trim().toLowerCase();

    return menu
      .filter((section) => activeCategory === null || section.category.id === activeCategory)
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => item.name.toLowerCase().includes(term)),
      }))
      .filter((section) => section.items.length > 0);
  }, [menu, search, activeCategory]);

  function handleAdd(item: MenuItem) {
    cart.addItem(item);
    toast.success(`Đã thêm "${item.name}" vào giỏ`, {
      icon: "🛒",
    });
  }

  async function handleRequest(type: TableRequestType) {
    if (!table || pendingRequests.has(type)) return;

    setPendingRequests((prev) => new Set(prev).add(type));
    try {
      await createTableRequest(table.id, type);
      toast.success(
        type === "call_staff" ? "Đã gửi yêu cầu gọi nhân viên 🔔" : "Đã gửi yêu cầu thanh toán 🧾",
        { icon: "✅" }
      );
      window.setTimeout(() => {
        setPendingRequests((prev) => {
          const next = new Set(prev);
          next.delete(type);
          return next;
        });
      }, 90_000);
    } catch (err) {
      console.error(err);
      toast.error("Không thể gửi yêu cầu, vui lòng thử lại.");
      setPendingRequests((prev) => {
        const next = new Set(prev);
        next.delete(type);
        return next;
      });
    }
  }

  async function handleSubmitOrder() {
    if (!table) return;
    setSubmitting(true);
    try {
      await createOrder({
        tableId: table.id,
        note: cart.generalNote,
        lines: cart.lines,
      });
      setCartOpen(false);
      setSuccessOpen(true);
    } catch (err) {
      console.error(err);
      toast.error("Gửi order thất bại, vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleContinueOrdering() {
    cart.clearCart();
    setSuccessOpen(false);
  }

  if (state === "loading") {
    return <PageSpinner label="Đang tải menu..." />;
  }

  if (state === "not-found") {
    return (
      <div className="mx-auto max-w-md px-4 py-20">
        <EmptyState
          icon="🙈"
          title="Không tìm thấy bàn"
          description="Mã QR này không hợp lệ hoặc bàn đã ngừng hoạt động. Vui lòng kiểm tra lại với nhân viên nhà hàng."
        />
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="mx-auto max-w-md px-4 py-20">
        <EmptyState
          icon="⚠️"
          title="Có lỗi xảy ra"
          description="Không thể tải menu lúc này. Vui lòng thử tải lại trang."
        />
      </div>
    );
  }

  return (
    <div className="min-h-svh pb-28">
      {/* Hero header */}
      <header className="relative overflow-hidden rounded-b-3xl bg-gradient-to-br from-brand-500 via-brand-600 to-orange-700 px-5 pb-8 pt-10 text-white shadow-lg shadow-brand-900/20">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-16 -left-10 h-44 w-44 rounded-full bg-white/10" />
        <div className="relative">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
            🍽️ QR Quick Order
          </span>
          <h1 className="mt-3 text-2xl font-extrabold leading-tight sm:text-3xl">
            Xin chào, {table ? getTableLabel(table) : ""}
          </h1>
          <p className="mt-1 text-sm text-white/85">Chọn món yêu thích của bạn 🧡</p>

          <div className="mt-4">
            <RequestButtons pending={pendingRequests} onRequest={handleRequest} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4">
        <div className="-mt-5 flex flex-col gap-3 rounded-3xl bg-white/80 p-3 shadow-lg shadow-stone-200/60 backdrop-blur-sm sm:p-4">
          <SearchBar value={search} onChange={setSearch} />
          <CategoryFilter
            categories={menu.map((section) => section.category)}
            activeId={activeCategory}
            onSelect={setActiveCategory}
          />
        </div>

        <div className="mt-6 flex flex-col gap-8">
          {filteredSections.length === 0 ? (
            <EmptyState
              icon="🔍"
              title="Không tìm thấy món nào"
              description="Thử tìm với từ khóa khác hoặc chọn danh mục khác nhé."
            />
          ) : (
            filteredSections.map((section) => (
              <section key={section.category.id}>
                <h2 className="mb-3 flex items-center gap-2 text-lg font-extrabold text-stone-900">
                  {section.category.name}
                  <span className="text-xs font-medium text-stone-400">
                    ({section.items.length} món)
                  </span>
                </h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {section.items.map((item) => (
                    <MenuCard key={item.id} item={item} onAdd={handleAdd} />
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      </main>

      <FloatingCartButton
        itemCount={cart.itemCount}
        totalAmount={cart.totalAmount}
        onClick={() => setCartOpen(true)}
      />

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onSubmit={handleSubmitOrder}
        submitting={submitting}
      />

      <OrderSuccessModal open={successOpen} onContinue={handleContinueOrdering} />
    </div>
  );
}
