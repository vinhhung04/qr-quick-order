import type { Category } from "../../types/menu";
import { cn } from "../../lib/utils";

interface CategoryFilterProps {
  categories: Category[];
  activeId: string | null;
  onSelect: (id: string | null) => void;
}

export function CategoryFilter({ categories, activeId, onSelect }: CategoryFilterProps) {
  return (
    <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
      <button
        onClick={() => onSelect(null)}
        className={cn(
          "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
          activeId === null
            ? "bg-stone-900 text-white shadow-md"
            : "bg-white text-stone-600 ring-1 ring-stone-200 hover:bg-stone-50"
        )}
      >
        Tất cả
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelect(category.id)}
          className={cn(
            "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
            activeId === category.id
              ? "bg-brand-500 text-white shadow-md shadow-brand-500/30"
              : "bg-white text-stone-600 ring-1 ring-stone-200 hover:bg-stone-50"
          )}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}
