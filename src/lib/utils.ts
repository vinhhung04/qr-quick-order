import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

const vndFormatter = new Intl.NumberFormat("vi-VN");

export function formatVND(amount: number): string {
  return `${vndFormatter.format(Math.round(amount))}đ`;
}

export function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);

  if (diffMin < 1) return "Vừa xong";
  if (diffMin < 60) return `${diffMin} phút trước`;

  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} giờ trước`;

  return date.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
  });
}

/** Display name for a table: its custom `label` if set, else "Bàn {number}". */
export function getTableLabel(table: { table_number: number; label: string | null }): string {
  return table.label?.trim() || `Bàn ${String(table.table_number).padStart(2, "0")}`;
}

export interface TimeSlot {
  id: string;
  label: string;
  range: string;
  startHour: number;
  /** Exclusive. May be smaller than `startHour` for slots that wrap past midnight. */
  endHour: number;
}

/** Fixed "khung giờ" buckets used to group staff order history by time of day. */
export const TIME_SLOTS: TimeSlot[] = [
  { id: "morning", label: "Buổi sáng", range: "06:00 - 11:00", startHour: 6, endHour: 11 },
  { id: "noon", label: "Buổi trưa", range: "11:00 - 14:00", startHour: 11, endHour: 14 },
  { id: "afternoon", label: "Buổi chiều", range: "14:00 - 18:00", startHour: 14, endHour: 18 },
  { id: "evening", label: "Buổi tối", range: "18:00 - 22:00", startHour: 18, endHour: 22 },
  { id: "night", label: "Đêm khuya", range: "22:00 - 06:00", startHour: 22, endHour: 6 },
];

/** Resolves which fixed time slot a timestamp falls into, by local hour-of-day. */
export function getTimeSlot(isoDate: string): TimeSlot {
  const hour = new Date(isoDate).getHours();
  return (
    TIME_SLOTS.find((slot) =>
      slot.startHour < slot.endHour
        ? hour >= slot.startHour && hour < slot.endHour
        : hour >= slot.startHour || hour < slot.endHour
    ) ?? TIME_SLOTS[0]
  );
}

/** Generates a short, URL-friendly random token, e.g. for new table QR codes. */
export function generateToken(prefix = "ban"): string {
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${random}`;
}
