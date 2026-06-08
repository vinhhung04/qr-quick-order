import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

interface BadgeProps {
  children: ReactNode;
  tone?: "popular" | "new" | "soldout" | "neutral";
  className?: string;
}

const toneStyles: Record<NonNullable<BadgeProps["tone"]>, string> = {
  popular: "bg-amber-400 text-amber-950",
  new: "bg-emerald-400 text-emerald-950",
  soldout: "bg-stone-800/80 text-white",
  neutral: "bg-white/90 text-stone-700",
};

export function Badge({ children, tone = "neutral", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide shadow-sm backdrop-blur-sm",
        toneStyles[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
