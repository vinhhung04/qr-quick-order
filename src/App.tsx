import { Link, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import OrderPage from "./pages/OrderPage";
import StaffOrdersPage from "./pages/StaffOrdersPage";
import StaffHistoryPage from "./pages/StaffHistoryPage";
import AdminMenuPage from "./pages/AdminMenuPage";
import AdminTablesPage from "./pages/AdminTablesPage";

export default function App() {
  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            borderRadius: "1rem",
            background: "#1c1917",
            color: "#fff",
            fontSize: "0.875rem",
            fontWeight: 600,
            padding: "0.7rem 1rem",
          },
          success: { iconTheme: { primary: "#fb923c", secondary: "#fff" } },
        }}
      />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/order/:qrToken" element={<OrderPage />} />
        <Route path="/staff/orders" element={<StaffOrdersPage />} />
        <Route path="/staff/history" element={<StaffHistoryPage />} />
        <Route path="/admin/menu" element={<AdminMenuPage />} />
        <Route path="/admin/tables" element={<AdminTablesPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

function HomePage() {
  const links = [
    { to: "/staff/orders", label: "📋 Màn hình order (nhân viên)", desc: "Xem order mới realtime" },
    { to: "/staff/history", label: "🗓️ Lịch sử gọi món", desc: "Xem lại order theo ngày & khung giờ" },
    { to: "/admin/menu", label: "🍲 Quản lý menu", desc: "Thêm, sửa, xóa món ăn" },
    { to: "/admin/tables", label: "🪑 Quản lý bàn & QR", desc: "Tạo bàn và lấy mã QR" },
  ];

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-8 px-4 py-16 text-center">
      <div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-3 py-1 text-xs font-bold text-brand-700">
          🍽️ QR Quick Order
        </span>
        <h1 className="mt-3 text-3xl font-extrabold text-stone-900">Realtime QR Food Ordering</h1>
        <p className="mt-1.5 text-sm text-stone-500">
          Khách quét QR tại bàn để gọi món — nhân viên nhận order ngay lập tức.
        </p>
      </div>

      <div className="grid w-full max-w-md gap-3">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="flex flex-col items-start gap-0.5 rounded-2xl bg-white p-4 text-left shadow-md shadow-stone-200/60 ring-1 ring-stone-100 transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <span className="font-bold text-stone-900">{link.label}</span>
            <span className="text-xs text-stone-500">{link.desc}</span>
          </Link>
        ))}
      </div>

      <p className="max-w-sm text-xs text-stone-400">
        Mẹo: tạo bàn ở trang "Quản lý bàn & QR", sau đó in mã QR và dán tại từng bàn để khách quét gọi
        món.
      </p>
    </div>
  );
}

function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-2 px-4 text-center">
      <span className="text-5xl">🍜</span>
      <h1 className="text-xl font-extrabold text-stone-800">Không tìm thấy trang</h1>
      <p className="text-sm text-stone-500">Đường dẫn bạn truy cập không tồn tại.</p>
    </div>
  );
}
