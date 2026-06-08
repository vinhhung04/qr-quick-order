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

/** Generates a short, URL-friendly random token, e.g. for new table QR codes. */
export function generateToken(prefix = "ban"): string {
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${random}`;
}
