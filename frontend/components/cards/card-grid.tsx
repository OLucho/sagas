"use client";

import { CardItem } from "./card-item";
import { CardGridSkeleton } from "@/components/ui/loading-skeleton";
import { EmptyState, NoFilterResultsEmptyState, NoCollectionCardsEmptyState } from "@/components/ui/empty-state";
import type { PokemonCard, CardVariant, CollectionCard, CollectionFilter } from "@/lib/types";

interface CardGridProps {
  cards: PokemonCard[];
  collectionRecord: Record<string, CollectionCard>;
  isAuthenticated: boolean;
  isLoading?: boolean;
  filter?: CollectionFilter;
  searchQuery?: string;
  onVariantChange?: (cardId: string, variant: CardVariant, quantity: number) => void;
  onCardClick?: (card: PokemonCard) => void;
  onRemoveCardClick?: (cardId: string) => void;
  onClearFilters?: () => void;
  showVariantSelector?: boolean;
}

export function CardGrid({
  cards,
  collectionRecord,
  isAuthenticated,
  isLoading = false,
  filter = "all",
  searchQuery = "",
  onVariantChange,
  onCardClick,
  onRemoveCardClick,
  onClearFilters,
  showVariantSelector = true,
}: CardGridProps) {
  if (isLoading) {
    return <CardGridSkeleton count={18} />;
  }

  // Filter cards based on collection status
  const filteredCards = cards.filter((card) => {
    const collectionData = collectionRecord[card.id];
    const totalQuantity = collectionData ? Object.values(collectionData.userVariants).reduce((a, b) => a + b, 0) : 0;

    if (filter === "all") return true;
    if (filter === "need") return totalQuantity === 0;
    if (filter === "have") return totalQuantity > 0;
    if (filter === "dupe") return totalQuantity > 1;
    return true;
  });

  // Empty states
  if (filteredCards.length === 0) {
    if (searchQuery) {
      return (
        <EmptyState
          icon="search"
          title="Sin resultados"
          description={`No encontramos cartas que coincidan con "${searchQuery}".`}
          action={onClearFilters ? {
            label: "Limpiar búsqueda",
            onClick: onClearFilters,
          } : undefined}
        />
      );
    }

    if (filter !== "all") {
      return <NoCollectionCardsEmptyState filter={filter} />;
    }

    return (
      <EmptyState
        icon="card"
        title="Sin cartas"
        description="No hay cartas para mostrar en este set."
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {filteredCards.map((card) => (
        <CardItem
          key={card.id}
          card={card}
          collectionData={collectionRecord[card.id]}
          isAuthenticated={isAuthenticated}
          onVariantChange={onVariantChange}
          onCardClick={onCardClick}
          onRemoveCardClick={onRemoveCardClick}
          showVariantSelector={showVariantSelector}
        />
      ))}
    </div>
  );
}
