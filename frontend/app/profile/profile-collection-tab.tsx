"use client";

import { useState, useMemo, useCallback } from "react";
import useSWR from "swr";
import { CardGrid } from "@/components/cards/card-grid";
import { CardDetailModal } from "@/components/cards/card-detail-modal";
import { CardFiltersBar } from "@/components/cards/card-filters";
import { CardGridSkeleton } from "@/components/ui/loading-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { useAuth } from "@/lib/auth-context";
import { fetchAllUserCollections, updateCardInCollection } from "@/lib/api-client";
import { fetchCardsByIds, getUniqueTypes, getUniqueRarities, getUniqueSupertypes } from "@/lib/pokemon-api";
import type { PokemonCard, CardVariant, CollectionCard, CardFilters } from "@/lib/types";

export function ProfileCollectionTab() {
  const { token } = useAuth();
  const [selectedCard, setSelectedCard] = useState<PokemonCard | null>(null);
  const [cardFilters, setCardFilters] = useState<CardFilters>({
    search: "",
    types: [],
    rarity: [],
    supertype: [],
  });

  // Fetch all collections (global)
  const {
    data: collectionEntries,
    error: collectionError,
    isLoading: collectionLoading,
    mutate: mutateCollection,
  } = useSWR(
    token ? "user-collections" : null,
    () => fetchAllUserCollections(token),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  // Determine owned card IDs (any variant qty > 0)
  const ownedCardIds = useMemo(() => {
    if (!collectionEntries) return [];
    return collectionEntries
      .filter((e) => Object.values(e.variants || {}).some((v) => v > 0))
      .map((e) => e.cardId);
  }, [collectionEntries]);

  // Fetch full Pokemon TCG card data for owned IDs
  const {
    data: cardsData,
    error: cardsError,
    isLoading: cardsLoading,
  } = useSWR(
    ownedCardIds.length > 0 ? ["cards-by-ids", ownedCardIds.join(",")] : null,
    () => fetchCardsByIds(ownedCardIds),
    { revalidateOnFocus: false, revalidateOnReconnect: false }
  );

  const cards = cardsData?.cards || [];

  // Build collectionRecord for CardGrid/CardItem
  const collectionRecord = useMemo(() => {
    const record: Record<string, CollectionCard> = {};
    if (!collectionEntries) return record;
    collectionEntries.forEach((entry) => {
      const total = Object.values(entry.variants || {}).reduce((a, b) => a + b, 0);
      record[entry.cardId] = {
        cardId: entry.cardId,
        availableVariants: Object.keys(entry.variants || {}) as CardVariant[],
        userVariants: entry.variants || {},
        status: total > 0 ? "have" : "none",
      };
    });
    return record;
  }, [collectionEntries]);

  // Available filter options from loaded cards
  const availableTypes = useMemo(() => getUniqueTypes(cards), [cards]);
  const availableRarities = useMemo(() => getUniqueRarities(cards), [cards]);
  const availableSupertypes = useMemo(() => getUniqueSupertypes(cards), [cards]);

  // Apply filters on the owned card set
  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      if (cardFilters.search) {
        const query = cardFilters.search.toLowerCase();
        if (!card.name.toLowerCase().includes(query) && !card.number.includes(query)) {
          return false;
        }
      }
      if (cardFilters.types.length > 0) {
        if (!card.types?.some((t) => cardFilters.types.includes(t))) return false;
      }
      if (cardFilters.rarity.length > 0) {
        if (!card.rarity || !cardFilters.rarity.includes(card.rarity)) return false;
      }
      if (cardFilters.supertype.length > 0) {
        if (!cardFilters.supertype.includes(card.supertype)) return false;
      }
      return true;
    });
  }, [cards, cardFilters]);

  // Handle variant changes
  const handleVariantChange = useCallback(
    async (cardId: string, variant: CardVariant, quantity: number) => {
      const entry = collectionEntries?.find((e) => e.cardId === cardId);
      if (!entry || !token) return;

      const existing = collectionRecord[cardId];
      const nextVariants = existing ? { ...existing.userVariants } : {};

      if (quantity > 0) {
        (nextVariants as Record<string, number>)[variant] = quantity;
      } else {
        delete (nextVariants as Record<string, number>)[variant];
      }

      // Optimistic update
      mutateCollection(
        (current) => {
          if (!current) return [];
          return current.map((c) => {
            if (c.cardId !== cardId) return c;
            return { ...c, variants: nextVariants };
          });
        },
        { revalidate: false }
      );

      try {
        await updateCardInCollection(entry.setId, cardId, nextVariants, token);
      } catch {
        mutateCollection();
      }
    },
    [collectionEntries, collectionRecord, token, mutateCollection]
  );

  const clearFilters = useCallback(() => {
    setCardFilters({
      search: "",
      types: [],
      rarity: [],
      supertype: [],
    });
  }, []);

  // Error states FIRST — if an endpoint errored, show it
  if (collectionError) {
    return (
      <ErrorState
        title="Error al cargar colección"
        message="No pudimos conectar con el servidor. Verifica tu conexión o intenta de nuevo."
        onRetry={() => mutateCollection()}
      />
    );
  }

  if (cardsError) {
    return (
      <ErrorState
        title="Error al cargar cartas"
        message="No pudimos obtener los datos de las cartas. Intenta de nuevo."
        onRetry={() => window.location.reload()}
      />
    );
  }

  // Loading
  if (collectionLoading || cardsLoading) {
    return (
      <div className="py-4">
        <CardGridSkeleton count={12} />
      </div>
    );
  }

  // Genuine empty state — endpoint succeeded but user has 0 cards
  if (cards.length === 0) {
    return (
      <EmptyState
        icon="card"
        title="Sin cartas"
        description="Aún no tienes cartas en tu colección. Explora los sets para empezar a agregar cartas."
      />
    );
  }

  return (
    <div className="space-y-6">
      <CardFiltersBar
        filters={cardFilters}
        onFiltersChange={setCardFilters}
        availableTypes={availableTypes}
        availableRarities={availableRarities}
        availableSupertypes={availableSupertypes}
      />

      <CardGrid
        cards={filteredCards}
        collectionRecord={collectionRecord}
        isAuthenticated={true}
        filter="all"
        searchQuery={cardFilters.search}
        onVariantChange={handleVariantChange}
        onCardClick={setSelectedCard}
        onClearFilters={clearFilters}
      />

      {selectedCard && (
        <CardDetailModal
          card={selectedCard}
          collectionData={collectionRecord[selectedCard.id]}
          isAuthenticated={true}
          onClose={() => setSelectedCard(null)}
          onVariantChange={handleVariantChange}
        />
      )}
    </div>
  );
}
