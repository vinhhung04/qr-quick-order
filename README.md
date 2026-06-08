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
  seed.sql      dữ liệu mẫu — menu nhà hàng "Vườn Dừa" (6 danh mục, 31 món, 17 bàn)
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
   **Run** để tạo dữ liệu mẫu — menu nhà hàng "Vườn Dừa" (6 danh mục, 31 món
   ăn/đồ uống) cùng 17 bàn: `ban-01` … `ban-13` (đánh số) và 4 khu vực có tên
   riêng — `phong-lanh-1`, `phong-lanh-2`, `choi-san`, `nha-go` (Phòng lạnh 1,
   Phòng lạnh 2, Chòi sàn, Nhà gỗ).

### 3. Bật Realtime cho bảng `orders`, `order_items`, `table_requests`

`schema.sql` đã tự động chạy
`alter publication supabase_realtime add table orders, order_items, table_requests;`.
Nếu vì lý do nào đó nó báo lỗi (ví dụ bảng đã có sẵn trong publication), bạn có
thể bật thủ công tại **Database → Replication**: tìm các bảng `orders`,
`order_items`, `table_requests` rồi bật toggle Realtime cho chúng.

### 4. Tạo Storage bucket cho ảnh món ăn

Trang `/admin/menu` cho phép tải ảnh món ăn trực tiếp từ máy lên **Supabase
Storage** (bucket `menu-images`, public read). Bucket cùng các policy RLS cần
thiết đã được tạo sẵn khi bạn chạy `schema.sql` ở bước 2 (lệnh `insert into
storage.buckets ...` cùng các policy `for select/insert/update/delete to anon`
trên `storage.objects`).

Nếu muốn kiểm tra hoặc tạo thủ công, vào **Storage** trong Supabase Dashboard,
xác nhận đã có bucket tên `menu-images` với **Public bucket** bật, và trong
**Policies** có các rule cho phép `anon` đọc/ghi vào bucket này.

### 5. Cấu hình biến môi trường

```bash
cp .env.example .env.local
```

Mở `.env.local` và điền:

```text
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

### 6. Cài đặt & chạy

```bash
npm install
npm run dev
```

Mở trình duyệt:

- Trang khách: `http://localhost:5173/order/ban-01` (hoặc `ban-02` … `ban-13`,
  `phong-lanh-1`, `phong-lanh-2`, `choi-san`, `nha-go`)
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
| `tables` | Bàn ăn — số bàn, `qr_token` riêng, trạng thái hoạt động, tên hiển thị tuỳ chọn (`label`, vd. "Phòng lạnh 1") |
| `categories` | Danh mục món ăn — tên, thứ tự hiển thị |
| `menu_items` | Món ăn/đồ uống — tên, mô tả, giá, ảnh, còn hàng/bán chạy/mới |
| `orders` | Đơn hàng — bàn nào đặt, tổng tiền, ghi chú chung. Được tạo qua RPC `create_order_with_items` (xem ghi chú bên dưới) |
| `order_items` | Chi tiết đơn — **lưu lại `item_name`/`price` tại thời điểm đặt** để lịch sử order không bị thay đổi khi admin sửa menu sau này |
| `table_requests` | Yêu cầu nhanh từ khách — gọi nhân viên / yêu cầu thanh toán, hiển thị realtime ở `/staff/orders` |

Chi tiết đầy đủ (kiểu dữ liệu, khóa ngoại, RLS policies) xem trong
[`supabase/schema.sql`](supabase/schema.sql).

> 🔒 **Order creation uses a Supabase RPC function `create_order_with_items`**
> so the order and its items are inserted atomically. If inserting items
> fails, the whole operation is rolled back and no empty order is left behind.

## 🎨 Ghi chú thiết kế

- Theme màu cam/đỏ ấm áp, gradient nhẹ, bo góc lớn (`rounded-2xl`/`3xl`),
  shadow mềm — tạo cảm giác "ngon miệng", phù hợp nhà hàng/cafe.
- Mobile-first: header dạng hero, category chips cuộn ngang, floating cart
  button, bottom sheet cho giỏ hàng.
- Toast (`react-hot-toast`), animation CSS nhẹ (pop khi thêm vào giỏ, slide-up
  cho bottom sheet, glow highlight cho order mới) để trải nghiệm mượt mà hơn.
- Giỏ hàng được lưu vào `localStorage` theo từng `qrToken`, nên khách lỡ tải
  lại trang vẫn không mất giỏ hàng.
