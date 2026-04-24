"use client";

import { cn } from "@/lib/utils";
import type { CardVariant } from "@/lib/types";

// Variant colors matching pkmn.gg style
const VARIANT_INFO: { variant: CardVariant; label: string; color: string }[] = [
  { variant: "normal", label: "Normal", color: "bg-emerald-500" },
  { variant: "holofoil", label: "Holofoil", color: "bg-amber-400" },
  { variant: "reverseHolofoil", label: "Reverse Holofoil", color: "bg-pink-500" },
  { variant: "1stEdition", label: "1st Edition", color: "bg-violet-500" },
  { variant: "1stEditionHolofoil", label: "1st Ed. Holo", color: "bg-sky-400" },
];

interface VariantLegendProps {
  variants?: CardVariant[];
  className?: string;
}

export function VariantLegend({ variants, className }: VariantLegendProps) {
  // If specific variants are provided, filter to only show those
  const visibleVariants = variants
    ? VARIANT_INFO.filter((v) => variants.includes(v.variant))
    : VARIANT_INFO;

  if (visibleVariants.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-3 text-sm", className)}>
      {visibleVariants.map(({ variant, label, color }) => (
        <div key={variant} className="flex items-center gap-1.5">
          <div
            className={cn(
              "h-4 w-4 rounded border-2 border-current",
              color
            )}
          />
          <span className="text-muted-foreground">={label}</span>
        </div>
      ))}
    </div>
  );
}
