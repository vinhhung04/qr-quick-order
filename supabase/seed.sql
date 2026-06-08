-- ============================================================================
-- QR Quick Order — Sample seed data
-- Run this AFTER schema.sql in the Supabase SQL Editor.
-- Safe to re-run: it clears existing rows in these tables first.
-- ============================================================================

truncate table public.order_items, public.orders, public.menu_items, public.categories, public.tables restart identity cascade;

-- ----------------------------------------------------------------------------
-- Categories
-- ----------------------------------------------------------------------------
insert into public.categories (id, name, sort_order) values
  ('11111111-0000-0000-0000-000000000001', 'Món chính', 1),
  ('11111111-0000-0000-0000-000000000002', 'Đồ uống', 2),
  ('11111111-0000-0000-0000-000000000003', 'Tráng miệng', 3),
  ('11111111-0000-0000-0000-000000000004', 'Combo', 4);

-- ----------------------------------------------------------------------------
-- Menu items (16) — Vietnamese names/descriptions, VND prices, Unsplash images
-- ----------------------------------------------------------------------------

-- Món chính
insert into public.menu_items (category_id, name, description, price, image_url, is_available, is_popular, is_new) values
  ('11111111-0000-0000-0000-000000000001', 'Phở bò tái', 'Nước dùng ninh xương 12 tiếng, thịt bò tái mềm, hành ngò thơm lừng', 65000, 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=600&q=80', true, true, false),
  ('11111111-0000-0000-0000-000000000001', 'Bún chả Hà Nội', 'Chả nướng than hoa, bún tươi, nước chấm chua ngọt đậm đà', 60000, 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=600&q=80', true, true, false),
  ('11111111-0000-0000-0000-000000000001', 'Cơm tấm sườn bì', 'Sườn nướng mật ong, bì heo, chả trứng, ăn kèm đồ chua', 55000, 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&q=80', true, false, false),
  ('11111111-0000-0000-0000-000000000001', 'Bánh mì thịt nướng', 'Bánh mì giòn rụm, thịt nướng thơm, pate, rau thơm tươi', 35000, 'https://images.unsplash.com/photo-1600628421066-f6bda6a7b976?w=600&q=80', true, false, true),
  ('11111111-0000-0000-0000-000000000001', 'Mì xào hải sản', 'Mì giòn xào cùng tôm, mực, rau củ tươi giòn', 70000, 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=600&q=80', false, false, false),
  ('11111111-0000-0000-0000-000000000001', 'Gỏi cuốn tôm thịt', 'Cuốn tươi mát với tôm, thịt, bún và rau sống, chấm tương đậu phộng', 45000, 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=600&q=80', true, false, true),

-- Đồ uống
  ('11111111-0000-0000-0000-000000000002', 'Trà đào cam sả', 'Trà đào thơm mát kết hợp cam tươi và sả, giải nhiệt tức thì', 39000, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&q=80', true, true, false),
  ('11111111-0000-0000-0000-000000000002', 'Cà phê sữa đá', 'Cà phê phin truyền thống hòa cùng sữa đặc béo ngậy', 29000, 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&q=80', true, true, false),
  ('11111111-0000-0000-0000-000000000002', 'Sinh tố bơ', 'Bơ sáp nguyên chất xay cùng sữa tươi, sánh mịn thơm béo', 45000, 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=600&q=80', true, false, false),
  ('11111111-0000-0000-0000-000000000002', 'Nước ép cam tươi', 'Cam vắt nguyên chất, giàu vitamin C, không thêm đường', 35000, 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=600&q=80', true, false, true),
  ('11111111-0000-0000-0000-000000000002', 'Trà vải hoa hồng', 'Trà thơm hương hoa hồng, vải ngọt thanh, topping thạch dai dai', 42000, 'https://images.unsplash.com/photo-1499638673689-79a0b5115d87?w=600&q=80', true, false, true),

-- Tráng miệng
  ('11111111-0000-0000-0000-000000000003', 'Chè khúc bạch', 'Thạch khúc bạch béo mịn, nhãn và hạnh nhân, nước đường thơm dịu', 32000, 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&q=80', true, true, false),
  ('11111111-0000-0000-0000-000000000003', 'Bánh flan caramel', 'Bánh flan mềm mịn phủ lớp caramel đắng nhẹ hấp dẫn', 25000, 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&q=80', true, false, false),
  ('11111111-0000-0000-0000-000000000003', 'Chè thái sầu riêng', 'Thập cẩm trái cây, sầu riêng béo thơm, nước cốt dừa mát lạnh', 38000, 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=600&q=80', true, false, true),

-- Combo
  ('11111111-0000-0000-0000-000000000004', 'Combo Phở + Trà đào', 'Một tô phở bò tái và một ly trà đào cam sả mát lạnh', 95000, 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=600&q=80', true, true, false),
  ('11111111-0000-0000-0000-000000000004', 'Combo Cơm tấm + Nước ép', 'Cơm tấm sườn bì cùng một ly nước ép cam tươi mát', 80000, 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&q=80', true, false, false);

-- ----------------------------------------------------------------------------
-- Tables (6), each with a unique qr_token used in /order/:qrToken
-- ----------------------------------------------------------------------------
insert into public.tables (table_number, qr_token, is_active) values
  (1, 'ban-01', true),
  (2, 'ban-02', true),
  (3, 'ban-03', true),
  (4, 'ban-04', true),
  (5, 'ban-05', true),
  (6, 'ban-06', true);
