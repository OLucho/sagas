"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { VariantSelector, VariantBadges, VariantCountBadge } from "./variant-selector";
import { cn } from "@/lib/utils";
import type { PokemonCard, CardVariant, CollectionCard } from "@/lib/types";
import { getCardVariants } from "@/lib/pokemon-api";

interface CardItemProps {
  card: PokemonCard;
  collectionData?: CollectionCard;
  isAuthenticated: boolean;
  onVariantChange?: (cardId: string, variant: CardVariant, quantity: number) => void;
  onCardClick?: (card: PokemonCard) => void;
  onRemoveCardClick?: (cardId: string) => void;
  showVariantSelector?: boolean;
  className?: string;
}

export function CardItem({
  card,
  collectionData,
  isAuthenticated,
  onVariantChange,
  onCardClick,
  onRemoveCardClick,
  showVariantSelector = true,
  className,
}: CardItemProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const availableVariants = getCardVariants(card);
  const userVariants = collectionData?.userVariants || {};
  const totalQuantity = Object.values(userVariants).reduce((a, b) => a + b, 0);
  const hasCard = totalQuantity > 0;

  const handleVariantChange = (variant: CardVariant, quantity: number) => {
    onVariantChange?.(card.id, variant, quantity);
  };

  const handleImageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onCardClick?.(card);
  };

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemoveCardClick?.(card.id);
  };

  return (
    <div className={cn("group relative flex flex-col", className)}>
      {/* Remove button on top-right corner */}
      {onRemoveCardClick && (
        <button
          onClick={handleRemoveClick}
          className="absolute -top-2 -right-2 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-white opacity-0 shadow transition hover:bg-destructive/90 group-hover:opacity-100"
          title="Eliminar de la lista"
        >
          <X className="h-3 w-3" />
        </button>
      )}

      {/* Card image with border highlight when owned */}
      <div
        className={cn(
          "relative mb-1 aspect-[2.5/3.5] w-full cursor-pointer overflow-hidden rounded-lg transition-all",
          hasCard && "ring-2 ring-emerald-500 ring-offset-1 ring-offset-background"
        )}
        onClick={handleImageClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onCardClick?.(card);
          }
        }}
      >
        {!imageLoaded && (
          <div className="absolute inset-0 animate-pulse rounded-lg bg-secondary" />
        )}
        <Image
          src={card.images.small}
          alt={card.name}
          fill
          className={cn(
            "object-contain transition-all group-hover:scale-105",
            imageLoaded ? "opacity-100" : "opacity-0"
          )}
          sizes="(max-width: 640px) 45vw, (max-width: 768px) 30vw, (max-width: 1024px) 22vw, 16vw"
          onLoad={() => setImageLoaded(true)}
        />
      </div>

      {/* Variant selector - positioned below card image like pkmn.gg */}
      {showVariantSelector && isAuthenticated && availableVariants.length > 0 && (
        <div
          className="mb-2 flex items-center justify-between"
          onClick={(e) => e.stopPropagation()}
        >
          <VariantSelector
            availableVariants={availableVariants}
            userVariants={userVariants}
            onVariantChange={handleVariantChange}
          />
          <VariantCountBadge count={availableVariants.length} />
        </div>
      )}

      {/* Read-only variant badges for non-authenticated */}
      {(!isAuthenticated || !showVariantSelector) && availableVariants.length > 1 && (
        <div className="mb-2 flex items-center justify-between">
          <VariantBadges
            variants={availableVariants}
            quantities={userVariants}
          />
          <VariantCountBadge count={availableVariants.length} />
        </div>
      )}

      {/* Card info */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-medium text-foreground" title={card.name}>
            {card.name}
          </h3>
          <p className="text-xs text-muted-foreground">
            #{card.number}
          </p>
        </div>
        {/* Rarity indicator */}
        {card.rarity && (
          <span className="shrink-0 text-xs text-muted-foreground">
            {getRaritySymbol(card.rarity)}
          </span>
        )}
      </div>
    </div>
  );
}

// Simple rarity symbols like pkmn.gg
function getRaritySymbol(rarity: string): string {
  const lower = rarity.toLowerCase();
  if (lower.includes('rare holo')) return '◆';
  if (lower.includes('rare')) return '★';
  if (lower.includes('uncommon')) return '◇';
  if (lower.includes('common')) return '○';
  if (lower.includes('promo')) return '☆';
  return '';
}
