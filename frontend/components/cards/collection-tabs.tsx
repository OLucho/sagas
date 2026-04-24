"use client";

import { cn } from "@/lib/utils";
import type { CollectionFilter } from "@/lib/types";

interface CollectionTabsProps {
  activeFilter: CollectionFilter;
  onFilterChange: (filter: CollectionFilter) => void;
  counts?: {
    all: number;
    have: number;
    need: number;
    dupe: number;
  };
  className?: string;
}

const tabs: { value: CollectionFilter; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "have", label: "Tengo" },
  { value: "need", label: "Necesito" },
  { value: "dupe", label: "Duplicadas" },
];

export function CollectionTabs({
  activeFilter,
  onFilterChange,
  counts,
  className,
}: CollectionTabsProps) {
  return (
    <div className={cn("flex items-center gap-6 border-b border-border pb-3", className)}>
      {tabs.map((tab) => {
        const isActive = activeFilter === tab.value;
        const count = counts?.[tab.value];

        return (
          <button
            key={tab.value}
            onClick={() => onFilterChange(tab.value)}
            className={cn(
              "relative inline-flex items-center gap-2 text-sm font-medium transition-colors",
              isActive
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
            {count !== undefined && (
              <span
                className={cn(
                  "text-sm",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}
              >
                ({count})
              </span>
            )}
            {/* Active indicator line */}
            {isActive && (
              <span className="absolute -bottom-3 left-0 right-0 h-0.5 rounded-full bg-primary" />
            )}
          </button>
        );
      })}
    </div>
  );
}
