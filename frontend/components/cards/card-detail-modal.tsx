"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PokemonCard, CardVariant, CollectionCard } from "@/lib/types";
import { getCardVariants } from "@/lib/pokemon-api";

// Variant display config
const VARIANT_CONFIG: Record<
  CardVariant,
  { label: string; color: string; borderColor: string; bgColor: string }
> = {
  normal: {
    label: "Normal",
    color: "text-emerald-400",
    borderColor: "border-emerald-500/40",
    bgColor: "bg-emerald-500/10",
  },
  holofoil: {
    label: "Holofoil",
    color: "text-amber-400",
    borderColor: "border-amber-400/40",
    bgColor: "bg-amber-400/10",
  },
  reverseHolofoil: {
    label: "Reverse Holofoil",
    color: "text-pink-400",
    borderColor: "border-pink-500/40",
    bgColor: "bg-pink-500/10",
  },
  "1stEdition": {
    label: "1st Edition",
    color: "text-violet-400",
    borderColor: "border-violet-500/40",
    bgColor: "bg-violet-500/10",
  },
  "1stEditionHolofoil": {
    label: "1st Edition Holofoil",
    color: "text-sky-400",
    borderColor: "border-sky-400/40",
    bgColor: "bg-sky-400/10",
  },
};

// Type gradient backgrounds — darkened with black overlay for readability
const TYPE_GRADIENT: Record<string, { from: string; via?: string; to: string }> = {
  Grass:    { from: "#0a2e18", via: "#0f3d1f", to: "#071f0f" },
  Fire:     { from: "#2a0f0f", via: "#3d1a0a", to: "#1f0a05" },
  Water:    { from: "#0a1a3d", via: "#0f2540", to: "#051a2e" },
  Lightning: { from: "#2a2005", via: "#3d3010", to: "#1a1505" },
  Electric:  { from: "#2a2005", via: "#3d3010", to: "#1a1505" },
  Psychic:  { from: "#1f0a3d", via: "#2a104a", to: "#15072e" },
  Fighting:  { from: "#2a1508", via: "#3d1f0a", to: "#1a0d05" },
  Darkness:  { from: "#111318", via: "#1a1d24", to: "#0a0c10" },
  Dark:      { from: "#111318", via: "#1a1d24", to: "#0a0c10" },
  Metal:     { from: "#15181e", via: "#1e2228", to: "#0f1115" },
  Fairy:    { from: "#2a0a20", via: "#3d1030", to: "#1f0515" },
  Dragon:   { from: "#1f0a0a", via: "#2a0a1f", to: "#150510" },
  Colorless: { from: "#15171c", via: "#1e2025", to: "#0f1015" },
  Normal:    { from: "#15171c", via: "#1e2025", to: "#0f1015" },
};

// Simple type icon mapping using colored circles + emoji fallback
const TYPE_ICON: Record<string, { emoji: string; color: string }> = {
  Grass: { emoji: "🌿", color: "#4ade80" },
  Fire: { emoji: "🔥", color: "#f87171" },
  Water: { emoji: "💧", color: "#60a5fa" },
  Lightning: { emoji: "⚡", color: "#facc15" },
  Electric: { emoji: "⚡", color: "#facc15" },
  Psychic: { emoji: "🔮", color: "#c084fc" },
  Fighting: { emoji: "👊", color: "#fb923c" },
  Darkness: { emoji: "🌑", color: "#6b7280" },
  Dark: { emoji: "🌑", color: "#6b7280" },
  Metal: { emoji: "⚙️", color: "#94a3b8" },
  Fairy: { emoji: "🧚", color: "#f9a8d4" },
  Dragon: { emoji: "🐉", color: "#f87171" },
  Colorless: { emoji: "⬜", color: "#d1d5db" },
  Normal: { emoji: "⬜", color: "#d1d5db" },
};

interface CardDetailModalProps {
  card: PokemonCard | null;
  collectionData?: CollectionCard;
  isAuthenticated: boolean;
  onClose: () => void;
  onVariantChange?: (cardId: string, variant: CardVariant, quantity: number) => void;
}

export function CardDetailModal({
  card,
  collectionData,
  isAuthenticated,
  onClose,
  onVariantChange,
}: CardDetailModalProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  // Guard: parent never renders with null card, but keep hook order safe
  const safeCard = card;
  if (!safeCard) return null;

  const availableVariants = getCardVariants(safeCard);
  const userVariants = collectionData?.userVariants || {};

  const handleQuantityChange = (variant: CardVariant, delta: number) => {
    if (!isAuthenticated || !onVariantChange) return;
    const current = (userVariants[variant] || 0);
    const next = Math.max(0, current + delta);
    onVariantChange(safeCard.id, variant, next);
  };

  // Build card metadata rows
  const metaRows = useMemo(() => {
    const rows: { label: string; value: React.ReactNode }[] = [];

    if (card.supertype) {
      rows.push({ label: "Supertype", value: card.supertype });
    }
    if (card.subtypes?.length) {
      rows.push({ label: "Subtypes", value: card.subtypes.join(", ") });
    }
    if (card.types?.length) {
      rows.push({
        label: "Type",
        value: (
          <span className="flex items-center gap-1">
            {card.types.map((t) => {
              const icon = TYPE_ICON[t] || { emoji: "⬜", color: "#d1d5db" };
              return (
                <span key={t} className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium" style={{ backgroundColor: icon.color + "20", color: icon.color }}>
                  <span>{icon.emoji}</span>
                  {t}
                </span>
              );
            })}
          </span>
        ),
      });
    }
    if (card.hp) {
      rows.push({ label: "HP", value: card.hp });
    }
    if (card.rarity) {
      rows.push({ label: "Rarity", value: card.rarity });
    }
    if (card.set?.name) {
      rows.push({ label: "Set", value: card.set.name });
    }
    if (card.artist) {
      rows.push({ label: "Artist", value: card.artist });
    }
    if (card.evolvesFrom) {
      rows.push({ label: "Evolves from", value: card.evolvesFrom });
    }
    if (card.evolvesTo?.length) {
      rows.push({ label: "Evolves to", value: card.evolvesTo.join(", ") });
    }
    if (card.nationalPokedexNumbers?.length) {
      rows.push({ label: "National #", value: card.nationalPokedexNumbers.join(", ") });
    }
    return rows;
  }, [card]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4 sm:p-8"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative my-auto flex w-full max-w-5xl flex-col gap-6 rounded-xl p-4 shadow-2xl sm:flex-row sm:p-6"
        style={{
          background: (() => {
            const primaryType = card.types?.[0];
            const g = primaryType ? TYPE_GRADIENT[primaryType] : null;
            if (!g) return "#1a1d24";
            return `linear-gradient(135deg, ${g.from} 0%, ${g.via || g.from} 50%, ${g.to} 100%)`;
          })(),
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 rounded-full bg-black/40 p-1.5 text-white/70 transition hover:bg-black/60 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Left: Card image — centered */}
        <div className="mx-auto flex w-full max-w-[340px] shrink-0 items-center justify-center sm:mx-0">
          <div className="relative aspect-[2.5/3.5] w-full overflow-hidden rounded-lg shadow-lg">
            {!imageLoaded && (
              <div className="absolute inset-0 animate-pulse rounded-lg bg-secondary" />
            )}
            <Image
              src={card.images.large}
              alt={card.name}
              fill
              className={cn(
                "object-contain transition-opacity",
                imageLoaded ? "opacity-100" : "opacity-0"
              )}
              sizes="(max-width: 640px) 80vw, 340px"
              onLoad={() => setImageLoaded(true)}
              priority
            />
          </div>
        </div>

        {/* Right: Card info */}
        <div className="flex min-w-0 flex-1 flex-col gap-5">
          {/* Header */}
          <div>
            <h2 className="text-2xl font-bold text-white sm:text-3xl">{card.name}</h2>
            <div className="mt-1 flex items-center gap-2 text-sm text-white/60">
              {card.set?.name && (
                <span className="font-medium text-white/80">{card.set.name}</span>
              )}
              <span>#{card.number} / {card.set?.printedTotal ?? "?"}</span>
            </div>
          </div>

          {/* Variants with counters — in the middle */}
          {availableVariants.length > 0 && isAuthenticated && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-white">Variants</h3>
              <div className="space-y-2">
                {availableVariants.map((variant) => {
                  const config = VARIANT_CONFIG[variant];
                  const qty = userVariants[variant] || 0;
                  return (
                    <div
                      key={variant}
                      className={cn(
                        "flex items-center justify-between rounded-lg border px-3 py-2.5",
                        config.borderColor,
                        config.bgColor
                      )}
                    >
                      <span className={cn("text-sm font-medium", config.color)}>
                        {config.label}
                      </span>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleQuantityChange(variant, -1)}
                          disabled={qty <= 0}
                          className="flex h-7 w-7 items-center justify-center rounded-md bg-white/10 text-white transition hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>

                        <span className="w-4 text-center text-sm font-semibold text-white tabular-nums">
                          {qty}
                        </span>

                        <button
                          onClick={() => handleQuantityChange(variant, 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-md bg-white/10 text-white transition hover:bg-white/20"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Read-only variants for non-authenticated — in the middle */}
          {availableVariants.length > 0 && !isAuthenticated && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-white">Variants</h3>
              <div className="flex flex-wrap gap-2">
                {availableVariants.map((variant) => {
                  const config = VARIANT_CONFIG[variant];
                  return (
                    <span
                      key={variant}
                      className={cn(
                        "inline-flex rounded border px-2 py-1 text-xs font-medium",
                        config.borderColor,
                        config.bgColor,
                        config.color
                      )}
                    >
                      {config.label}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Metadata grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
            {metaRows.map((row) => (
              <div key={row.label}>
                <p className="text-xs font-medium uppercase tracking-wide text-white/40">{row.label}</p>
                <div className="mt-0.5 text-sm text-white/80">{row.value}</div>
              </div>
            ))}
          </div>

          {/* Attacks */}
          {card.attacks && card.attacks.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-white">Attacks</h3>
              {card.attacks.map((atk, i) => (
                <div key={i} className="rounded-lg bg-black/20 p-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm font-medium text-white">
                      {atk.cost.map((c, ci) => {
                        const icon = TYPE_ICON[c] || { emoji: "⬜", color: "#d1d5db" };
                        return <span key={ci}>{icon.emoji}</span>;
                      })}
                      {atk.name}
                    </span>
                    <span className="text-sm font-bold text-white">{atk.damage}</span>
                  </div>
                  {atk.text && (
                    <p className="mt-1 text-xs text-white/50">{atk.text}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Weakness / Resistance / Retreat */}
          <div className="flex flex-wrap gap-4 text-sm">
            {card.weaknesses && card.weaknesses.length > 0 && (
              <div>
                <span className="text-xs font-medium uppercase text-white/40">Weakness</span>
                <div className="mt-0.5 flex items-center gap-1 text-white/80">
                  {card.weaknesses.map((w) => {
                    const icon = TYPE_ICON[w.type] || { emoji: "⬜", color: "#d1d5db" };
                    return (
                      <span key={w.type} className="inline-flex items-center gap-0.5">
                        <span>{icon.emoji}</span> {w.value}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
            {card.resistances && card.resistances.length > 0 && (
              <div>
                <span className="text-xs font-medium uppercase text-white/40">Resistance</span>
                <div className="mt-0.5 flex items-center gap-1 text-white/80">
                  {card.resistances.map((r) => {
                    const icon = TYPE_ICON[r.type] || { emoji: "⬜", color: "#d1d5db" };
                    return (
                      <span key={r.type} className="inline-flex items-center gap-0.5">
                        <span>{icon.emoji}</span> {r.value}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
            {card.retreatCost && card.retreatCost.length > 0 && (
              <div>
                <span className="text-xs font-medium uppercase text-white/40">Retreat</span>
                <div className="mt-0.5 flex items-center gap-0.5 text-white/80">
                  {card.retreatCost.map((rc, i) => {
                    const icon = TYPE_ICON[rc] || { emoji: "⬜", color: "#d1d5db" };
                    return <span key={i}>{icon.emoji}</span>;
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
