import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-stone-200 bg-white/60 px-6 py-16 text-center">
      {icon && (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-3xl">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-bold text-stone-800">{title}</h3>
      {description && <p className="max-w-xs text-sm text-stone-500">{description}</p>}
      {action}
    </div>
  );
}
