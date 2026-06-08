import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import type { TableRow } from "../../types/database";
import { cn } from "../../lib/utils";

interface QRTableCardProps {
  table: TableRow;
  onToggleActive: (table: TableRow) => void;
}

export function QRTableCard({ table, onToggleActive }: QRTableCardProps) {
  const [copied, setCopied] = useState(false);
  const orderUrl = `${window.location.origin}/order/${table.qr_token}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(orderUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard API unavailable — silently ignore.
    }
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-3xl bg-white p-5 text-center shadow-md shadow-stone-200/60 ring-1 ring-stone-100 transition",
        !table.is_active && "opacity-60"
      )}
    >
      <span className="rounded-2xl bg-stone-900 px-4 py-2 text-base font-extrabold text-white">
        Bàn {String(table.table_number).padStart(2, "0")}
      </span>

      <div className="rounded-2xl bg-white p-3 ring-1 ring-stone-100">
        <QRCodeSVG value={orderUrl} size={140} />
      </div>

      <p className="line-clamp-1 w-full rounded-lg bg-stone-50 px-2.5 py-1.5 text-xs text-stone-500">
        {orderUrl}
      </p>

      <div className="flex w-full gap-2">
        <button
          onClick={handleCopy}
          className="flex-1 rounded-xl bg-brand-50 px-3 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-100"
        >
          {copied ? "✓ Đã copy" : "📋 Copy link"}
        </button>
        <button
          onClick={() => onToggleActive(table)}
          className={cn(
            "flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition",
            table.is_active
              ? "bg-stone-100 text-stone-600 hover:bg-stone-200"
              : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
          )}
        >
          {table.is_active ? "Tắt bàn" : "Kích hoạt"}
        </button>
      </div>
    </div>
  );
}
