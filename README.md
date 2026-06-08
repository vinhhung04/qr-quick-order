# QR Quick Order – Realtime QR Food Ordering App

Khách quét mã QR tại bàn → xem menu đẹp → chọn món → gửi order. Nhân viên mở
màn hình realtime để thấy order mới ngay lập tức, không cần refresh.

**Stack:** React + Vite + TypeScript · Tailwind CSS · Supabase (Postgres +
Realtime) · React Router · deploy free trên Vercel.

## ✨ Tính năng

- **`/order/:qrToken`** — Trang khách gọi món: hero header theo số bàn, search,
  filter danh mục, card món ăn đẹp với badge "Bán chạy"/"Món mới", giỏ hàng
  dạng bottom sheet (tăng/giảm số lượng, ghi chú từng món, ghi chú chung), modal
  "Đã gửi order thành công".
- **`/staff/orders`** — Màn hình nhân viên xem order realtime: order mới tự
  xuất hiện kèm toast, âm thanh thông báo và hiệu ứng highlight, không cần
  refresh.
- **`/admin/menu`** — Quản lý menu: thêm/sửa/xóa món, bật-tắt còn hàng, quản lý
  danh mục.
- **`/admin/tables`** — Quản lý bàn & QR: tạo bàn mới, xem link `/order/:qrToken`,
  copy link, hiển thị mã QR để in/quét thử.

## 📁 Cấu trúc thư mục

```text
src/
  components/   menu/ cart/ staff/ admin/ ui/
  pages/        OrderPage, StaffOrdersPage, AdminMenuPage, AdminTablesPage
  context/      CartContext (giỏ hàng theo từng bàn, lưu localStorage)
  lib/          supabase client, utils, notification sound
  services/     menuService, orderService, tableService
  types/        database, menu, order
supabase/
  schema.sql    SQL schema + RLS + realtime publication
  seed.sql      dữ liệu mẫu (4 danh mục, 16 món, 6 bàn)
```

## 🚀 Chạy local

### 1. Tạo Supabase project

1. Vào [supabase.com](https://supabase.com) → tạo project mới (free tier).
2. Vào **Project Settings → API**, lấy `Project URL` và `anon public key`.

### 2. Chạy SQL schema & seed data

1. Mở **SQL Editor** trong Supabase Dashboard.
2. Copy toàn bộ nội dung [`supabase/schema.sql`](supabase/schema.sql), dán vào
   và bấm **Run**.
3. Copy toàn bộ nội dung [`supabase/seed.sql`](supabase/seed.sql), dán vào và
   **Run** để tạo dữ liệu mẫu (4 danh mục, 16 món ăn/đồ uống, 6 bàn với
   `qr_token` lần lượt là `ban-01` … `ban-06`).

### 3. Bật Realtime cho bảng `orders`

`schema.sql` đã tự động chạy
`alter publication supabase_realtime add table orders, order_items;`. Nếu vì
lý do nào đó nó báo lỗi (ví dụ bảng đã có sẵn trong publication), bạn có thể
bật thủ công tại **Database → Replication**: tìm bảng `orders` (và
`order_items`) rồi bật toggle Realtime cho chúng.

### 4. Cấu hình biến môi trường

```bash
cp .env.example .env.local
```

Mở `.env.local` và điền:

```text
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

### 5. Cài đặt & chạy

```bash
npm install
npm run dev
```

Mở trình duyệt:

- Trang khách: `http://localhost:5173/order/ban-01` (hoặc `ban-02` … `ban-06`)
- Màn hình nhân viên: `http://localhost:5173/staff/orders`
- Quản lý menu: `http://localhost:5173/admin/menu`
- Quản lý bàn & QR: `http://localhost:5173/admin/tables`

> 💡 Mở `/order/ban-01` ở một tab và `/staff/orders` ở tab khác — gửi order từ
> trang khách và xem nó xuất hiện realtime ở màn hình nhân viên kèm toast +
> âm thanh + hiệu ứng highlight.

## 📦 Build production

```bash
npm run build
```

## ☁️ Deploy lên Vercel

1. Push code lên GitHub.
2. Vào [vercel.com](https://vercel.com) → **New Project** → import repo này.
3. Framework Preset: **Vite** (Vercel sẽ tự nhận diện).
4. Vào **Project Settings → Environment Variables**, thêm:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Bấm **Deploy**.

File [`vercel.json`](vercel.json) đã cấu hình rewrite `/* → /index.html` để
các route phía client (React Router) hoạt động đúng khi reload trang.

## 🗄️ Database schema (tóm tắt)

| Bảng | Mục đích |
| --- | --- |
| `tables` | Bàn ăn — số bàn, `qr_token` riêng, trạng thái hoạt động |
| `categories` | Danh mục món ăn — tên, thứ tự hiển thị |
| `menu_items` | Món ăn/đồ uống — tên, mô tả, giá, ảnh, còn hàng/bán chạy/mới |
| `orders` | Đơn hàng — bàn nào đặt, tổng tiền, ghi chú chung |
| `order_items` | Chi tiết đơn — **lưu lại `item_name`/`price` tại thời điểm đặt** để lịch sử order không bị thay đổi khi admin sửa menu sau này |

Chi tiết đầy đủ (kiểu dữ liệu, khóa ngoại, RLS policies) xem trong
[`supabase/schema.sql`](supabase/schema.sql).

## 🎨 Ghi chú thiết kế

- Theme màu cam/đỏ ấm áp, gradient nhẹ, bo góc lớn (`rounded-2xl`/`3xl`),
  shadow mềm — tạo cảm giác "ngon miệng", phù hợp nhà hàng/cafe.
- Mobile-first: header dạng hero, category chips cuộn ngang, floating cart
  button, bottom sheet cho giỏ hàng.
- Toast (`react-hot-toast`), animation CSS nhẹ (pop khi thêm vào giỏ, slide-up
  cho bottom sheet, glow highlight cho order mới) để trải nghiệm mượt mà hơn.
- Giỏ hàng được lưu vào `localStorage` theo từng `qrToken`, nên khách lỡ tải
  lại trang vẫn không mất giỏ hàng.
