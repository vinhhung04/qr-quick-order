-- ============================================================================
-- QR Quick Order — Sample seed data ("Vườn Dừa" restaurant menu)
-- Run this AFTER schema.sql in the Supabase SQL Editor.
-- Safe to re-run: it clears existing rows in these tables first.
-- ============================================================================

truncate table public.table_requests, public.order_items, public.orders, public.menu_items, public.categories, public.tables restart identity cascade;

-- ----------------------------------------------------------------------------
-- Categories
-- ----------------------------------------------------------------------------
insert into public.categories (id, name, sort_order) values
  ('22222222-0000-0000-0000-000000000001', 'Món nướng', 1),
  ('22222222-0000-0000-0000-000000000002', 'Món chiên', 2),
  ('22222222-0000-0000-0000-000000000003', 'Cơm - Mì', 3),
  ('22222222-0000-0000-0000-000000000004', 'Món lẩu', 4),
  ('22222222-0000-0000-0000-000000000005', 'Món khác', 5),
  ('22222222-0000-0000-0000-000000000006', 'Đồ uống', 6);

-- ----------------------------------------------------------------------------
-- Menu items — Vietnamese names/descriptions, VND prices, Unsplash images
-- ----------------------------------------------------------------------------

-- Món nướng
insert into public.menu_items (category_id, name, description, price, image_url, is_available, is_popular, is_new) values
  ('22222222-0000-0000-0000-000000000001', 'Bò lạc nướng', 'Thịt bò lạc tươi ướp gia vị đậm đà, nướng than hoa thơm lừng', 170000, 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=600&q=80', true, true, false),
  ('22222222-0000-0000-0000-000000000001', 'Bẹ sữa heo nướng', 'Bẹ sữa heo nướng vàng giòn, chấm muối tiêu chanh đậm vị', 170000, 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=600&q=80', true, false, false),
  ('22222222-0000-0000-0000-000000000001', 'Gà nướng (1/2 con)', 'Nửa con gà ta nướng mật ong, da giòn thịt mềm ngọt', 170000, 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&q=80', true, true, false),
  ('22222222-0000-0000-0000-000000000001', 'Tôm nướng (hấp)', 'Tôm tươi nướng/hấp giữ trọn vị ngọt tự nhiên, ăn kèm muối ớt xanh', 170000, 'https://images.unsplash.com/photo-1600628421066-f6bda6a7b976?w=600&q=80', true, false, false),
  ('22222222-0000-0000-0000-000000000001', 'Heo lai nướng', 'Thịt heo lai nướng thơm phức, lớp mỡ giòn tan hấp dẫn', 170000, 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=600&q=80', true, false, false),
  ('22222222-0000-0000-0000-000000000001', 'Mẹt gà + thịt xiên que + cơm lam', 'Mẹt đầy đủ gà nướng, thịt xiên que và cơm lam, hợp cho nhóm bạn', 300000, 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=600&q=80', true, true, false),

-- Món chiên
  ('22222222-0000-0000-0000-000000000002', 'Mực trứng chiên nước mắm', 'Mực trứng tươi chiên giòn, áo lớp nước mắm sánh đậm đà', 170000, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&q=80', true, true, false),
  ('22222222-0000-0000-0000-000000000002', 'Gà chiên nước mắm', 'Gà chiên vàng ươm, sốt nước mắm tỏi ớt cay nhẹ cuốn vị', 140000, 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&q=80', true, false, false),
  ('22222222-0000-0000-0000-000000000002', 'Chả mực Hạ Long', 'Chả mực giã tay kiểu Hạ Long, chiên vàng giòn dai ngọt thịt', 200000, 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=600&q=80', true, true, false),
  ('22222222-0000-0000-0000-000000000002', 'Cá khô chỉ chiên', 'Cá khô chỉ chiên giòn rụm, nhâm nhi cùng vài lon bia mát lạnh', 60000, 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=600&q=80', true, false, false),
  ('22222222-0000-0000-0000-000000000002', 'Cá viên chiên + xúc xích', 'Set ăn vặt cá viên và xúc xích chiên giòn, chấm tương ớt', 50000, 'https://images.unsplash.com/photo-1499638673689-79a0b5115d87?w=600&q=80', true, false, true),

-- Cơm - Mì
  ('22222222-0000-0000-0000-000000000003', 'Cơm chiên', 'Cơm chiên trứng thơm bùi, hạt cơm tơi săn đều màu vàng đẹp mắt', 80000, 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&q=80', true, false, false),
  ('22222222-0000-0000-0000-000000000003', 'Mì xào hải sản (bò)', 'Mì xào giòn cùng hải sản và thịt bò, rau củ tươi giòn', 100000, 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=600&q=80', true, false, false),

-- Món lẩu
  ('22222222-0000-0000-0000-000000000004', 'Lẩu gà ớt xanh', 'Lẩu gà nước dùng chua cay ớt xanh, ấm bụng cho cả nhóm', 220000, 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=600&q=80', true, true, false),
  ('22222222-0000-0000-0000-000000000004', 'Lẩu hải sản', 'Lẩu hải sản tươi ngon, nước lẩu đậm đà chua cay vừa miệng', 220000, 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&q=80', true, true, false),

-- Món khác
  ('22222222-0000-0000-0000-000000000005', 'Cháo gà (1 con)', 'Cháo gà nguyên con ninh nhừ, thơm gừng và hành lá, ấm bụng', 350000, 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=600&q=80', true, false, false),
  ('22222222-0000-0000-0000-000000000005', 'Bò nhúng giấm', 'Bò nhúng giấm chua thanh, cuốn bánh tráng rau sống đúng điệu', 170000, 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=600&q=80', true, true, false),
  ('22222222-0000-0000-0000-000000000005', 'Heo lai hấp gừng', 'Heo lai hấp gừng giữ nguyên vị ngọt thịt, thơm nhẹ mùi gừng tươi', 200000, 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&q=80', true, false, false),
  ('22222222-0000-0000-0000-000000000005', 'Mực nhúng ớt', 'Mực tươi nhúng nước lẩu ớt cay nồng, giòn ngọt đúng điệu', 220000, 'https://images.unsplash.com/photo-1600628421066-f6bda6a7b976?w=600&q=80', true, false, false),
  ('22222222-0000-0000-0000-000000000005', 'Mực hấp gừng', 'Mực hấp gừng giữ vị ngọt tự nhiên, chấm muối tiêu chanh', 200000, 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=600&q=80', true, false, false),
  ('22222222-0000-0000-0000-000000000005', 'Cồi sò xào xả ớt', 'Cồi sò xào xả ớt cay thơm, đậm đà bắt cơm', 100000, 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=600&q=80', true, false, false),
  ('22222222-0000-0000-0000-000000000005', 'Salad trộn', 'Salad rau củ tươi trộn sốt chua ngọt thanh mát, giải ngấy', 50000, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&q=80', true, false, false),
  ('22222222-0000-0000-0000-000000000005', 'Đậu phộng', 'Đậu phộng rang giòn thơm, món nhấm nháp không thể thiếu', 20000, 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&q=80', true, false, false),
  ('22222222-0000-0000-0000-000000000005', 'Trái cây', 'Đĩa trái cây tươi theo mùa, tráng miệng thanh mát cuối bữa', 70000, 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=600&q=80', true, false, true),

-- Đồ uống
  ('22222222-0000-0000-0000-000000000006', 'Heineken lùn', 'Bia Heineken lon lùn ướp lạnh sảng khoái', 20000, 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=600&q=80', true, false, false),
  ('22222222-0000-0000-0000-000000000006', 'Heineken cao', 'Bia Heineken lon cao đậm vị, ướp lạnh sẵn sàng phục vụ', 23000, 'https://images.unsplash.com/photo-1499638673689-79a0b5115d87?w=600&q=80', true, false, false),
  ('22222222-0000-0000-0000-000000000006', 'Tiger bạc', 'Bia Tiger bạc nhẹ dịu, dễ uống, ướp lạnh mát rượi', 21000, 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&q=80', true, false, false),
  ('22222222-0000-0000-0000-000000000006', 'Tiger nâu', 'Bia Tiger nâu đậm đà hương lúa mạch, ướp lạnh sảng khoái', 20000, 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=600&q=80', true, false, false),
  ('22222222-0000-0000-0000-000000000006', 'Sài Gòn xanh', 'Bia Sài Gòn xanh quen thuộc, ướp lạnh đậm đà', 16000, 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=600&q=80', true, false, false),
  ('22222222-0000-0000-0000-000000000006', 'Coca / Pepsi / 7Up', 'Nước ngọt có gas Coca, Pepsi hoặc 7Up ướp lạnh', 15000, 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&q=80', true, false, false),
  ('22222222-0000-0000-0000-000000000006', 'Nước suối', 'Nước suối tinh khiết đóng chai, giải khát tức thì', 10000, 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=600&q=80', true, false, false);

-- ----------------------------------------------------------------------------
-- Tables (17): Bàn 01–13 (đánh số) + 4 khu vực đặc biệt có tên riêng,
-- mỗi bàn một `qr_token` duy nhất dùng trong /order/:qrToken
-- ----------------------------------------------------------------------------
insert into public.tables (table_number, qr_token, label, is_active) values
  (1, 'ban-01', null, true),
  (2, 'ban-02', null, true),
  (3, 'ban-03', null, true),
  (4, 'ban-04', null, true),
  (5, 'ban-05', null, true),
  (6, 'ban-06', null, true),
  (7, 'ban-07', null, true),
  (8, 'ban-08', null, true),
  (9, 'ban-09', null, true),
  (10, 'ban-10', null, true),
  (11, 'ban-11', null, true),
  (12, 'ban-12', null, true),
  (13, 'ban-13', null, true),
  (14, 'phong-lanh-1', 'Phòng lạnh 1', true),
  (15, 'phong-lanh-2', 'Phòng lạnh 2', true),
  (16, 'choi-san', 'Chòi sàn', true),
  (17, 'nha-go', 'Nhà gỗ', true);
