"use client";

import { useState, useMemo, useCallback } from "react";
import useSWR from "swr";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CollectionTabs } from "@/components/cards/collection-tabs";
import { CardFiltersBar } from "@/components/cards/card-filters";
import { CardGrid } from "@/components/cards/card-grid";
import { CardDetailModal } from "@/components/cards/card-detail-modal";
import { SetDetailSkeleton } from "@/components/ui/loading-skeleton";
import { ErrorState, NotFoundState } from "@/components/ui/error-state";
import { useAuth } from "@/lib/auth-context";
import { fetchSet, fetchSetCards, getUniqueTypes, getUniqueRarities, getUniqueSupertypes } from "@/lib/pokemon-api";
import { fetchAllUserCollections, updateCardInCollection } from "@/lib/api-client";
import type { PokemonSet, PokemonCard, CollectionFilter, CardFilters, CardVariant, CollectionCard, UserCardVariants } from "@/lib/types";

interface SetDetailClientProps {
  setId: string;
}

export function SetDetailClient({ setId }: SetDetailClientProps) {
  const { isAuthenticated, token } = useAuth();
  const [collectionFilter, setCollectionFilter] = useState<CollectionFilter>("all");
  const [cardFilters, setCardFilters] = useState<CardFilters>({
    search: "",
    types: [],
    rarity: [],
    supertype: [],
  });
  const [selectedCard, setSelectedCard] = useState<PokemonCard | null>(null);

  const setSwrKey = useMemo(() => ["set", setId], [setId]);
  const cardsSwrKey = useMemo(() => ["set-cards", setId], [setId]);

  const {
    data: set,
    error: setError,
    isLoading: setLoading,
  } = useSWR<PokemonSet>(setSwrKey, ([, id]) => fetchSet(id), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  const {
    data: cardsData,
    error: cardsError,
    isLoading: cardsLoading,
    mutate: mutateCards,
  } = useSWR(cardsSwrKey, ([, id]) => fetchSetCards(id), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  const {
    data: allCollections,
    mutate: mutateAllCollections,
    error: collectionError,
  } = useSWR(
    isAuthenticated ? ["user-collections", token] : null,
    () => fetchAllUserCollections(token),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  // Filter global collection to current set
  const collectionRecord = useMemo(() => {
    const record: Record<string, CollectionCard> = {};
    if (!allCollections) return record;
    allCollections.forEach((entry) => {
      if (entry.setId !== setId) return;
      const total = Object.values(entry.variants || {}).reduce((a, b) => a + b, 0);
      record[entry.cardId] = {
        cardId: entry.cardId,
        availableVariants: Object.keys(entry.variants || {}) as CardVariant[],
        userVariants: entry.variants || {},
        status: total > 0 ? "have" : "none",
      };
    });
    return record;
  }, [allCollections, setId]);

  const cards = cardsData?.cards || [];

  // Extract filter options from cards
  const availableTypes = useMemo(() => getUniqueTypes(cards), [cards]);
  const availableRarities = useMemo(() => getUniqueRarities(cards), [cards]);
  const availableSupertypes = useMemo(() => getUniqueSupertypes(cards), [cards]);

  // Apply search and attribute filters
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

  // Calculate collection counts
  const collectionCounts = useMemo(() => {
    let have = 0;
    let dupe = 0;
    filteredCards.forEach((card) => {
      const data = collectionRecord[card.id];
      const total = data ? Object.values(data.userVariants).reduce((a, b) => a + b, 0) : 0;
      if (total > 0) have++;
      if (total > 1) dupe++;
    });
    return {
      all: filteredCards.length,
      have,
      need: filteredCards.length - have,
      dupe,
    };
  }, [collectionRecord, filteredCards]);

  // Handle variant changes – use mutator function to avoid stale closure
  const handleVariantChange = useCallback(
    async (cardId: string, variant: CardVariant, quantity: number) => {
      if (!isAuthenticated || !token) return;

      // Optimistic update via SWR mutator function
      mutateAllCollections(
        (current) => {
          if (!current) return [];
          return current.map((entry) => {
            if (entry.cardId !== cardId || entry.setId !== setId) return entry;
            const existing = collectionRecord[cardId];
            const nextVariants: UserCardVariants = existing ? { ...existing.userVariants } : {};

            if (quantity > 0) {
              (nextVariants as Record<string, number>)[variant] = quantity;
            } else {
              delete (nextVariants as Record<string, number>)[variant];
            }

            return { ...entry, variants: nextVariants };
          });
        },
        { revalidate: false }
      );

      // Build the same payload for the API
      const existing = collectionRecord[cardId];
      const nextVariantsForApi: UserCardVariants = existing ? { ...existing.userVariants } : {};
      if (quantity > 0) {
        (nextVariantsForApi as Record<string, number>)[variant] = quantity;
      } else {
        delete (nextVariantsForApi as Record<string, number>)[variant];
      }

      try {
        await updateCardInCollection(setId, cardId, nextVariantsForApi, token);
      } catch {
        // Revert by revalidating from server
        mutateAllCollections();
      }
    },
    [isAuthenticated, token, mutateAllCollections, setId, collectionRecord]
  );

  const clearFilters = useCallback(() => {
    setCardFilters({
      search: "",
      types: [],
      rarity: [],
      supertype: [],
    });
    setCollectionFilter("all");
  }, []);

  // Loading / error states
  if (setLoading || cardsLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <SetDetailSkeleton />
      </div>
    );
  }

  if (setError) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <NotFoundState title="Set no encontrado" message="El set que buscas no existe o fue removido." />
      </div>
    );
  }

  if (cardsError) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <ErrorState title="Error al cargar cartas" message="No pudimos cargar las cartas de este set." onRetry={() => mutateCards()} />
      </div>
    );
  }

  if (collectionError) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <ErrorState title="Error al cargar tu colección" message="No pudimos cargar tu colección para este set." onRetry={() => mutateAllCollections()} />
      </div>
    );
  }

  if (!set) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Button asChild variant="ghost" className="mb-4 gap-2">
        <Link href="/sets">
          <ChevronLeft className="h-4 w-4" />
          Volver a sets
        </Link>
      </Button>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative h-20 w-40 shrink-0">
          {set.images?.logo ? (
            <Image src={set.images.logo} alt={set.name} fill className="object-contain object-left" sizes="160px" priority />
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded bg-secondary">
              <span className="text-lg font-bold text-muted-foreground">{set.name}</span>
            </div>
          )}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{set.name}</h1>
          <p className="text-muted-foreground">
            {set.series} &bull; {set.printedTotal} cartas &bull; {new Date(set.releaseDate).toLocaleDateString("es-AR", { year: "numeric", month: "long" })}
          </p>
        </div>
      </div>

      <CollectionTabs
        activeFilter={collectionFilter}
        onFilterChange={setCollectionFilter}
        counts={isAuthenticated ? collectionCounts : { all: filteredCards.length, have: 0, need: 0, dupe: 0 }}
        className="mb-6"
      />

      <CardFiltersBar
        filters={cardFilters}
        onFiltersChange={setCardFilters}
        availableTypes={availableTypes}
        availableRarities={availableRarities}
        availableSupertypes={availableSupertypes}
        className="mb-6"
      />

      <CardGrid
        cards={filteredCards}
        collectionRecord={collectionRecord}
        isAuthenticated={isAuthenticated}
        filter={collectionFilter}
        searchQuery={cardFilters.search}
        onVariantChange={handleVariantChange}
        onCardClick={setSelectedCard}
        onClearFilters={clearFilters}
      />

      {selectedCard && (
        <CardDetailModal
          card={selectedCard}
          collectionData={collectionRecord[selectedCard.id]}
          isAuthenticated={isAuthenticated}
          onClose={() => setSelectedCard(null)}
          onVariantChange={handleVariantChange}
        />
      )}
    </div>
  );
}
