import { useEffect, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import {
  createCategory,
  createMenuItem,
  deleteCategory,
  deleteMenuItem,
  getMenu,
  setMenuItemAvailability,
  updateMenuItem,
  type MenuItemInput,
} from "../services/menuService";
import type { MenuItem, MenuSection } from "../types/menu";
import { AdminMenuForm } from "../components/admin/AdminMenuForm";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { PageSpinner } from "../components/ui/Spinner";
import { formatVND, cn } from "../lib/utils";

export default function AdminMenuPage() {
  const [sections, setSections] = useState<MenuSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");

  async function reload() {
    setSections(await getMenu());
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const data = await getMenu();
      if (!cancelled) {
        setSections(data);
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  function openCreateForm() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEditForm(item: MenuItem) {
    setEditing(item);
    setFormOpen(true);
  }

  async function handleFormSubmit(input: MenuItemInput) {
    if (editing) {
      await updateMenuItem(editing.id, input);
      toast.success("Đã cập nhật món ăn");
    } else {
      await createMenuItem(input);
      toast.success("Đã thêm món mới");
    }
    await reload();
  }

  async function handleToggleAvailability(item: MenuItem) {
    try {
      await setMenuItemAvailability(item.id, !item.is_available);
      await reload();
    } catch {
      toast.error("Không thể cập nhật trạng thái món.");
    }
  }

  async function handleDelete(item: MenuItem) {
    if (!confirm(`Xóa món "${item.name}"? Hành động này không thể hoàn tác.`)) return;
    try {
      await deleteMenuItem(item.id);
      toast.success("Đã xóa món ăn");
      await reload();
    } catch {
      toast.error("Không thể xóa món ăn.");
    }
  }

  async function handleAddCategory(e: FormEvent) {
    e.preventDefault();
    const name = newCategoryName.trim();
    if (!name) return;
    try {
      await createCategory(name, sections.length);
      setNewCategoryName("");
      toast.success("Đã thêm danh mục");
      await reload();
    } catch {
      toast.error("Không thể thêm danh mục.");
    }
  }

  async function handleDeleteCategory(id: string, name: string, itemCount: number) {
    if (itemCount > 0) {
      toast.error("Danh mục còn món ăn, không thể xóa.");
      return;
    }
    if (!confirm(`Xóa danh mục "${name}"?`)) return;
    try {
      await deleteCategory(id);
      toast.success("Đã xóa danh mục");
      await reload();
    } catch {
      toast.error("Không thể xóa danh mục.");
    }
  }

  const categories = sections.map((section) => section.category);

  return (
    <div className="min-h-svh px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-stone-900">🍲 Quản lý menu</h1>
            <p className="text-sm text-stone-500">Thêm, sửa, xóa món ăn và bật/tắt trạng thái còn món</p>
          </div>
          <Button onClick={openCreateForm}>+ Thêm món mới</Button>
        </header>

        <form
          onSubmit={handleAddCategory}
          className="mb-6 flex flex-wrap items-center gap-2 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-stone-100"
        >
          <span className="px-1 text-sm font-semibold text-stone-600">Thêm danh mục:</span>
          <input
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Tên danh mục mới"
            className="h-10 flex-1 rounded-xl border border-stone-200 bg-stone-50 px-3 text-sm outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
          />
          <Button type="submit" size="md" variant="secondary">
            Thêm
          </Button>
        </form>

        {loading ? (
          <PageSpinner label="Đang tải menu..." />
        ) : sections.length === 0 ? (
          <EmptyState icon="🍽️" title="Chưa có danh mục nào" description="Hãy thêm danh mục đầu tiên ở trên." />
        ) : (
          <div className="flex flex-col gap-6">
            {sections.map((section) => (
              <section key={section.category.id}>
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="text-lg font-extrabold text-stone-900">{section.category.name}</h2>
                  <button
                    onClick={() =>
                      handleDeleteCategory(section.category.id, section.category.name, section.items.length)
                    }
                    className="text-xs font-semibold text-stone-400 transition hover:text-red-500"
                  >
                    Xóa danh mục
                  </button>
                </div>

                {section.items.length === 0 ? (
                  <p className="rounded-2xl bg-white px-4 py-3 text-sm text-stone-400 ring-1 ring-stone-100">
                    Chưa có món nào trong danh mục này.
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {section.items.map((item) => (
                      <div
                        key={item.id}
                        className={cn(
                          "flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-stone-100",
                          !item.is_available && "opacity-60"
                        )}
                      >
                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-stone-100">
                          {item.image_url ? (
                            <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-lg">🍽️</div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-bold text-stone-900">{item.name}</p>
                          <p className="text-sm font-semibold text-brand-600">{formatVND(item.price)}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1.5">
                          <button
                            onClick={() => handleToggleAvailability(item)}
                            className={cn(
                              "rounded-lg px-2.5 py-1.5 text-xs font-semibold transition",
                              item.is_available
                                ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                : "bg-stone-100 text-stone-500 hover:bg-stone-200"
                            )}
                          >
                            {item.is_available ? "Còn hàng" : "Hết hàng"}
                          </button>
                          <button
                            onClick={() => openEditForm(item)}
                            className="rounded-lg bg-brand-50 px-2.5 py-1.5 text-xs font-semibold text-brand-700 transition hover:bg-brand-100"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            className="rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>
        )}
      </div>

      <AdminMenuForm
        key={editing ? `edit-${editing.id}` : "create"}
        open={formOpen}
        categories={categories}
        initial={editing}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
}
