import { useEffect, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { createTable, getAllTables, setTableActive } from "../services/tableService";
import type { TableRow } from "../types/database";
import { QRTableCard } from "../components/admin/QRTableCard";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { PageSpinner } from "../components/ui/Spinner";
import { generateToken } from "../lib/utils";

export default function AdminTablesPage() {
  const [tables, setTables] = useState<TableRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableNumber, setTableNumber] = useState("");
  const [creating, setCreating] = useState(false);

  async function reload() {
    setTables(await getAllTables());
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const data = await getAllTables();
      if (!cancelled) {
        setTables(data);
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    const number = Number(tableNumber);
    if (!number || number <= 0) {
      toast.error("Vui lòng nhập số bàn hợp lệ.");
      return;
    }
    if (tables.some((table) => table.table_number === number)) {
      toast.error("Số bàn này đã tồn tại.");
      return;
    }

    setCreating(true);
    try {
      await createTable(number, generateToken("ban"));
      toast.success(`Đã tạo Bàn ${String(number).padStart(2, "0")}`);
      setTableNumber("");
      await reload();
    } catch {
      toast.error("Không thể tạo bàn mới.");
    } finally {
      setCreating(false);
    }
  }

  async function handleToggleActive(table: TableRow) {
    try {
      await setTableActive(table.id, !table.is_active);
      await reload();
    } catch {
      toast.error("Không thể cập nhật trạng thái bàn.");
    }
  }

  return (
    <div className="min-h-svh px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-6">
          <h1 className="text-2xl font-extrabold text-stone-900">🪑 Quản lý bàn & mã QR</h1>
          <p className="text-sm text-stone-500">
            Tạo bàn mới, lấy link đặt món và mã QR để in dán tại bàn
          </p>
        </header>

        <form
          onSubmit={handleCreate}
          className="mb-6 flex flex-wrap items-center gap-2 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-stone-100"
        >
          <span className="px-1 text-sm font-semibold text-stone-600">Thêm bàn mới — Số bàn:</span>
          <input
            type="number"
            min={1}
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            placeholder="Ví dụ: 7"
            className="h-10 w-32 rounded-xl border border-stone-200 bg-stone-50 px-3 text-sm outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
          />
          <Button type="submit" size="md" disabled={creating}>
            {creating ? "Đang tạo..." : "+ Tạo bàn"}
          </Button>
        </form>

        {loading ? (
          <PageSpinner label="Đang tải danh sách bàn..." />
        ) : tables.length === 0 ? (
          <EmptyState icon="🪑" title="Chưa có bàn nào" description="Tạo bàn đầu tiên để bắt đầu nhận order qua QR." />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tables.map((table) => (
              <QRTableCard key={table.id} table={table} onToggleActive={handleToggleActive} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
