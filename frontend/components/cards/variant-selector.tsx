"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CardVariant, UserCardVariants } from "@/lib/types";

// Variant colors matching pkmn.gg style
const VARIANT_COLORS: Record<CardVariant, { bg: string; border: string; activeBg: string }> = {
  normal: {
    bg: "bg-emerald-500/20",
    border: "border-emerald-500",
    activeBg: "bg-emerald-500",
  },
  holofoil: {
    bg: "bg-amber-400/20",
    border: "border-amber-400",
    activeBg: "bg-amber-400",
  },
  reverseHolofoil: {
    bg: "bg-pink-500/20",
    border: "border-pink-500",
    activeBg: "bg-pink-500",
  },
  '1stEdition': {
    bg: "bg-violet-500/20",
    border: "border-violet-500",
    activeBg: "bg-violet-500",
  },
  '1stEditionHolofoil': {
    bg: "bg-sky-400/20",
    border: "border-sky-400",
    activeBg: "bg-sky-400",
  },
};

const VARIANT_LABELS: Record<CardVariant, string> = {
  normal: 'Normal',
  holofoil: 'Holo',
  reverseHolofoil: 'Reverse',
  '1stEdition': '1st Ed',
  '1stEditionHolofoil': '1st Holo',
};

interface VariantSelectorProps {
  availableVariants: CardVariant[];
  userVariants: UserCardVariants;
  onVariantChange: (variant: CardVariant, quantity: number) => void;
  disabled?: boolean;
  className?: string;
}

export function VariantSelector({
  availableVariants,
  userVariants,
  onVariantChange,
  disabled = false,
  className,
}: VariantSelectorProps) {
  if (availableVariants.length === 0) {
    return null;
  }

  const totalSelected = availableVariants.filter(v => (userVariants[v] || 0) > 0).length;
  const visibleVariants = availableVariants.slice(0, 4);
  const extraCount = availableVariants.length - 4;

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {visibleVariants.map((variant) => {
        const quantity = userVariants[variant] || 0;
        const isSelected = quantity > 0;
        const colors = VARIANT_COLORS[variant];

        return (
          <button
            key={variant}
            onClick={() => onVariantChange(variant, isSelected ? 0 : 1)}
            disabled={disabled}
            title={VARIANT_LABELS[variant]}
            className={cn(
              "relative flex h-6 w-6 items-center justify-center rounded border-2 transition-all",
              isSelected
                ? cn(colors.activeBg, colors.border, "text-white")
                : cn("bg-card", colors.border, "opacity-40 hover:opacity-70"),
              disabled && "cursor-not-allowed opacity-30"
            )}
          >
            {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
          </button>
        );
      })}
      
      {extraCount > 0 && (
        <span className="ml-0.5 text-[10px] font-medium text-muted-foreground">
          +{extraCount}
        </span>
      )}
    </div>
  );
}

// Badge showing variant count for card
export function VariantCountBadge({
  count,
  className,
}: {
  count: number;
  className?: string;
}) {
  if (count <= 1) return null;
  
  return (
    <span className={cn(
      "text-[10px] font-medium text-primary",
      className
    )}>
      +{count} Variantes
    </span>
  );
}

// Read-only variant badges for non-authenticated users
export function VariantBadges({
  variants,
  quantities,
  className,
}: {
  variants: CardVariant[];
  quantities?: UserCardVariants;
  className?: string;
}) {
  const visibleVariants = variants.slice(0, 4);
  const extraCount = variants.length - 4;

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {visibleVariants.map((variant) => {
        const qty = quantities?.[variant] || 0;
        const hasQuantity = qty > 0;
        const colors = VARIANT_COLORS[variant];

        return (
          <div
            key={variant}
            title={VARIANT_LABELS[variant]}
            className={cn(
              "flex h-5 w-5 items-center justify-center rounded border-2",
              hasQuantity
                ? cn(colors.activeBg, colors.border, "text-white")
                : cn("bg-card", colors.border, "opacity-30")
            )}
          >
            {hasQuantity && <Check className="h-3 w-3 stroke-[3]" />}
          </div>
        );
      })}
      
      {extraCount > 0 && (
        <span className="ml-0.5 text-[10px] font-medium text-muted-foreground">
          +{extraCount}
        </span>
      )}
    </div>
  );
}
