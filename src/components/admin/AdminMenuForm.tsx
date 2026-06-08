import { useState, type FormEvent, type ReactNode } from "react";
import type { Category, MenuItem } from "../../types/menu";
import type { MenuItemInput } from "../../services/menuService";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { cn } from "../../lib/utils";

const inputClass =
  "w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 text-sm text-stone-800 outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-100";

interface AdminMenuFormProps {
  open: boolean;
  categories: Category[];
  initial: MenuItem | null;
  onClose: () => void;
  onSubmit: (input: MenuItemInput) => Promise<void>;
}

const emptyForm: MenuItemInput = {
  category_id: "",
  name: "",
  description: "",
  price: 0,
  image_url: "",
  is_available: true,
  is_popular: false,
  is_new: false,
};

export function AdminMenuForm({ open, categories, initial, onClose, onSubmit }: AdminMenuFormProps) {
  const [form, setForm] = useState<MenuItemInput>(() =>
    initial
      ? {
          category_id: initial.category_id,
          name: initial.name,
          description: initial.description ?? "",
          price: initial.price,
          image_url: initial.image_url ?? "",
          is_available: initial.is_available,
          is_popular: initial.is_popular,
          is_new: initial.is_new,
        }
      : { ...emptyForm, category_id: categories[0]?.id ?? "" }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.category_id || form.price <= 0) {
      setError("Vui lòng nhập tên món, chọn danh mục và giá lớn hơn 0.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await onSubmit(form);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
      <form onSubmit={handleSubmit} className="text-left">
        <h2 className="mb-4 text-lg font-extrabold text-stone-900">
          {initial ? "Sửa món ăn" : "Thêm món mới"}
        </h2>

        <div className="flex flex-col gap-3">
          <Field label="Tên món">
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className={inputClass}
              placeholder="Ví dụ: Phở bò tái"
            />
          </Field>

          <Field label="Danh mục">
            <select
              value={form.category_id}
              onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
              className={inputClass}
            >
              <option value="" disabled>
                Chọn danh mục
              </option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Mô tả ngắn">
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={2}
              className={cn(inputClass, "resize-none")}
              placeholder="Mô tả ngắn gọn về món ăn"
            />
          </Field>

          <Field label="Giá (VND)">
            <input
              type="number"
              min={0}
              value={form.price || ""}
              onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
              className={inputClass}
              placeholder="50000"
            />
          </Field>

          <Field label="URL hình ảnh">
            <input
              value={form.image_url}
              onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
              className={inputClass}
              placeholder="https://images.unsplash.com/..."
            />
          </Field>

          <div className="flex flex-wrap gap-4 pt-1">
            <Checkbox
              label="Còn hàng"
              checked={form.is_available}
              onChange={(checked) => setForm((f) => ({ ...f, is_available: checked }))}
            />
            <Checkbox
              label="🔥 Bán chạy"
              checked={form.is_popular}
              onChange={(checked) => setForm((f) => ({ ...f, is_popular: checked }))}
            />
            <Checkbox
              label="✨ Món mới"
              checked={form.is_new}
              onChange={(checked) => setForm((f) => ({ ...f, is_new: checked }))}
            />
          </div>
        </div>

        {error && <p className="mt-3 text-sm font-medium text-red-500">{error}</p>}

        <div className="mt-5 flex gap-3">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" className="flex-1" disabled={saving}>
            {saving ? "Đang lưu..." : initial ? "Lưu thay đổi" : "Thêm món"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-left">
      <span className="text-sm font-semibold text-stone-700">{label}</span>
      {children}
    </label>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm font-medium text-stone-600">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-stone-300 text-brand-500 focus:ring-brand-300"
      />
      {label}
    </label>
  );
}
