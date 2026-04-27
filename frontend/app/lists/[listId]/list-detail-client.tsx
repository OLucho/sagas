"use client";

import { useState, useMemo, useCallback } from "react";
import useSWR from "swr";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Share2,
  Pencil,
  Trash2,
  Globe,
  Lock,
  Copy,
  Check,
  ExternalLink,
  X,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CardGrid } from "@/components/cards/card-grid";
import { CollectionTabs } from "@/components/cards/collection-tabs";
import { CardFiltersBar } from "@/components/cards/card-filters";
import { CardDetailModal } from "@/components/cards/card-detail-modal";
import { EditListModal } from "@/components/lists/edit-list-modal";
import { AddCardsModal } from "@/components/lists/add-cards-modal";
import { ListGridSkeleton } from "@/components/ui/loading-skeleton";
import { ErrorState, NotFoundState, ForbiddenState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { useAuth } from "@/lib/auth-context";
import {
  fetchList,
  fetchListCards,
  updateListCardVariants,
  removeCardFromList,
} from "@/lib/api-client";
import { fetchCardsByIds, getUniqueTypes, getUniqueRarities, getUniqueSupertypes } from "@/lib/pokemon-api";
import type {
  UserList,
  ListCard,
  CollectionFilter,
  CardFilters,
  CardVariant,
  CollectionCard,
  PokemonCard,
} from "@/lib/types";
import { toast } from "@/hooks/use-toast";

interface ListDetailClientProps {
  listId: string;
}

export function ListDetailClient({ listId }: ListDetailClientProps) {
  const router = useRouter();
  const { user, isAuthenticated, token } = useAuth();
  const [collectionFilter, setCollectionFilter] = useState<CollectionFilter>("all");
  const [cardFilters, setCardFilters] = useState<CardFilters>({
    search: "",
    types: [],
    rarity: [],
    supertype: [],
  });
  const [selectedCard, setSelectedCard] = useState<PokemonCard | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addCardsModalOpen, setAddCardsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [removingCardId, setRemovingCardId] = useState<string | null>(null);
  const [removeConfirmOpen, setRemoveConfirmOpen] = useState(false);

  // Fetch list info
  const {
    data: list,
    error: listError,
    isLoading: listLoading,
    mutate: mutateList,
  } = useSWR<UserList>(`list-${listId}`, () => fetchList(listId, token), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    shouldRetryOnError: false,
  });

  // Determine ownership
  const isOwner = isAuthenticated && user && list && list.userId === user.id;
  const hasAccess = list?.isPublic || isOwner;

  // Fetch list card entries (backend returns id, cardId, variants)
  const {
    data: listCardEntries,
    error: cardsError,
    isLoading: cardsLoading,
    mutate: mutateCards,
  } = useSWR(
    list && hasAccess ? `list-cards-${listId}` : null,
    () => fetchListCards(listId, token),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
    }
  );

  // Fetch full Pokemon TCG card data
  const cardIds = useMemo(() => listCardEntries?.map((e) => e.cardId) ?? [], [listCardEntries]);

  const {
    data: cardsData,
    error: cardsDataError,
    isLoading: cardsDataLoading,
    mutate: mutateCardsData,
  } = useSWR(
    cardIds.length > 0 ? [`list-card-details-${listId}`, cardIds.join(",")] : null,
    () => fetchCardsByIds(cardIds),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
    }
  );

  const pokemonCards = useMemo(() => cardsData?.cards ?? [], [cardsData]);
  const pokemonCardsById = useMemo(() => {
    const map = new Map<string, PokemonCard>();
    pokemonCards.forEach((c) => map.set(c.id, c));
    return map;
  }, [pokemonCards]);

  // Combine list entries with Pokemon card data into ListCard[]
  const listCards: ListCard[] = useMemo(() => {
    return (
      listCardEntries?.
        map((entry) => {
          const card = pokemonCardsById.get(entry.cardId);
          if (!card) return null;
          return {
            cardId: entry.cardId,
            card,
            variants: entry.variants,
            addedAt: entry.addedAt,
          };
        })
        .filter(Boolean) as ListCard[]
    ) ?? [];
  }, [listCardEntries, pokemonCardsById]);

  // Build collection record for CardGrid (shows variant quantities)
  const collectionRecord = useMemo(() => {
    const record: Record<string, CollectionCard> = {};
    listCardEntries?.forEach((entry) => {
      const total = Object.values(entry.variants || {}).reduce((a, b) => a + b, 0);
      record[entry.cardId] = {
        cardId: entry.cardId,
        availableVariants: Object.keys(entry.variants || {}) as CardVariant[],
        userVariants: entry.variants || {},
        status: total > 0 ? "have" : "none",
      };
    });
    return record;
  }, [listCardEntries]);

  const cards = useMemo(() => listCards.map((lc) => lc.card).filter(Boolean), [listCards]);

  const availableTypes = useMemo(() => getUniqueTypes(cards), [cards]);
  const availableRarities = useMemo(() => getUniqueRarities(cards), [cards]);
  const availableSupertypes = useMemo(() => getUniqueSupertypes(cards), [cards]);

  // Apply filters
  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      if (cardFilters.search) {
        const query = cardFilters.search.toLowerCase();
        if (!card.name.toLowerCase().includes(query) && !card.number.includes(query)) return false;
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

  // Collection counts
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
  }, [filteredCards, collectionRecord]);

  // Handlers
  const handleEditList = async (updates: { name?: string; isPublic?: boolean }) => {
    try {
      await fetch(`/api/lists/${listId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(updates),
      });
      mutateList();
      toast({ title: "Lista actualizada" });
    } catch {
      toast({ title: "Error al actualizar lista", description: "Intenta de nuevo", variant: "destructive" });
    }
  };

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/lists/${listId}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVariantChange = useCallback(
    async (cardId: string, variant: CardVariant, quantity: number) => {
      const entry = listCardEntries?.find((e) => e.cardId === cardId);
      if (!entry || !token) return;

      const nextVariants = { ...entry.variants };
      if (quantity > 0) nextVariants[variant] = quantity;
      else delete nextVariants[variant];

      // Optimistic update
      mutateCards(
        (current) => {
          if (!current) return [];
          return current.map((c) => (c.cardId === cardId ? { ...c, variants: nextVariants } : c));
        },
        { revalidate: false }
      );

      try {
        await updateListCardVariants(listId, cardId, nextVariants, token);
      } catch (err) {
        mutateCards();
        toast({
          title: "Error al guardar",
          description: err instanceof Error ? err.message : "No se pudo actualizar la carta",
          variant: "destructive",
        });
      }
    },
    [listCardEntries, token, mutateCards, listId]
  );

  const handleRemoveCard = async () => {
    if (!removingCardId || !token) return;
    try {
      await removeCardFromList(listId, removingCardId, token);
      mutateCards();
      mutateCardsData();
      toast({ title: "Carta eliminada de la lista" });
    } catch (err) {
      toast({
        title: "Error al eliminar",
        description: err instanceof Error ? err.message : "No se pudo eliminar la carta",
        variant: "destructive",
      });
    } finally {
      setRemoveConfirmOpen(false);
      setRemovingCardId(null);
    }
  };

  const clearFilters = () => {
    setCardFilters({ search: "", types: [], rarity: [], supertype: [] });
    setCollectionFilter("all");
  };

  // Loading state
  if (listLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="h-8 w-32 animate-pulse rounded-md bg-secondary" />
          <div className="mt-4 h-10 w-64 animate-pulse rounded-md bg-secondary" />
        </div>
        <ListGridSkeleton count={6} />
      </div>
    );
  }

  // Error / Not found / Forbidden
  if (listError) {
    const errorMsg = listError instanceof Error ? listError.message : "";
    if (errorMsg.includes("permiso") || errorMsg.includes("privada")) {
      return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <ForbiddenState
            title="Lista privada"
            message="Esta lista es privada y solo puede ser vista por su creador."
          />
        </div>
      );
    }
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <ErrorState
          title="Error al cargar lista"
          message={errorMsg || "No pudimos cargar la lista."}
          onRetry={() => mutateList()}
        />
      </div>
    );
  }

  if (!list) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <NotFoundState title="Lista no encontrada" message="La lista que buscas no existe o fue eliminada." />
      </div>
    );
  }

  // No access (private list, not owner) — safety net
  if (!hasAccess) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <ForbiddenState
          title="Lista privada"
          message="Esta lista es privada y solo puede ser vista por su creador."
        />
      </div>
    );
  }

  const createdDate = list.createdAt
    ? new Date(list.createdAt).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })
    : "Sin fecha";
  const updatedDate = list.updatedAt
    ? new Date(list.updatedAt).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })
    : createdDate;

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back button */}
        {isOwner && (
          <Button asChild variant="ghost" className="mb-4 gap-2">
            <Link href="/my-lists">
              <ChevronLeft className="h-4 w-4" />
              Mis listas
            </Link>
          </Button>
        )}

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{list.name}</h1>
              <div
                className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                  list.isPublic ? "bg-success/10 text-success" : "bg-secondary text-muted-foreground"
                }`}
              >
                {list.isPublic ? (
                  <>
                    <Globe className="h-3 w-3" /> Pública
                  </>
                ) : (
                  <>
                    <Lock className="h-3 w-3" /> Privada
                  </>
                )}
              </div>
            </div>
            <p className="mt-2 text-muted-foreground">
              {listCards.length} {listCards.length === 1 ? "carta" : "cartas"} • Creada el {createdDate}
              {updatedDate !== createdDate && ` • Actualizada el ${updatedDate}`}
            </p>
          </div>

          {/* Actions - only for owner */}
          {isOwner && (
            <div className="flex gap-2">
              {list.isPublic && (
                <Button variant="outline" onClick={handleCopyLink} className="gap-2">
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" /> Copiado
                    </>
                  ) : (
                    <>
                      <Share2 className="h-4 w-4" /> Compartir
                    </>
                  )}
                </Button>
              )}
              <Button variant="outline" onClick={() => setEditModalOpen(true)}>
                <Pencil className="mr-2 h-4 w-4" /> Editar
              </Button>
              <Button onClick={() => setAddCardsModalOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" /> Agregar cartas
              </Button>
            </div>
          )}
        </div>

        {/* Cards content */}
        {listCards.length === 0 && !cardsLoading && (
          <EmptyState
            icon="card"
            title="Sin cartas"
            description="Esta lista aún no tiene cartas."
            action={
              isOwner
                ? { label: "Agregar cartas", onClick: () => setAddCardsModalOpen(true) }
                : undefined
            }
          />
        )}

        {listCards.length > 0 && (
          <>
            {/* Collection tabs */}
            <CollectionTabs
              activeFilter={collectionFilter}
              onFilterChange={setCollectionFilter}
              counts={collectionCounts}
              className="mb-6"
            />

            {/* Filters */}
            <CardFiltersBar
              filters={cardFilters}
              onFiltersChange={setCardFilters}
              availableTypes={availableTypes}
              availableRarities={availableRarities}
              availableSupertypes={availableSupertypes}
              className="mb-6"
            />

            {/* Cards grid */}
            <CardGrid
              cards={filteredCards}
              collectionRecord={collectionRecord}
              isAuthenticated={isOwner || false}
              filter={collectionFilter}
              searchQuery={cardFilters.search}
              onCardClick={setSelectedCard}
              onVariantChange={handleVariantChange}
              onClearFilters={clearFilters}
            />

            {/* Remove button on top of each card — rendered via CardItem overlay wrapper */}
            {isOwner && (
              <div className="mt-4 flex flex-wrap gap-2">
                {listCards.map((lc) => (
                  <div key={lc.cardId} className="group relative">
                    <button
                      onClick={() => {
                        setRemovingCardId(lc.cardId);
                        setRemoveConfirmOpen(true);
                      }}
                      className="absolute -top-2 -right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-white opacity-0 shadow transition hover:bg-destructive/90 group-hover:opacity-100"
                      title="Eliminar de la lista"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal: Card detail */}
      {selectedCard && (
        <CardDetailModal
          card={selectedCard}
          collectionData={collectionRecord[selectedCard.id]}
          isAuthenticated={isOwner || false}
          onClose={() => setSelectedCard(null)}
          onVariantChange={handleVariantChange}
        />
      )}

      {/* Modal: Edit list */}
      {isOwner && (
        <>
          <EditListModal
            open={editModalOpen}
            onOpenChange={setEditModalOpen}
            list={list}
            onSubmit={handleEditList}
          />

          {/* Modal: Add cards */}
          <AddCardsModal
            open={addCardsModalOpen}
            onOpenChange={setAddCardsModalOpen}
            listId={listId}
            existingCardIds={new Set(cardIds)}
            onCardsAdded={() => {
              mutateCards();
              mutateCardsData();
            }}
          />
        </>
      )}

      {/* Dialog: Confirm remove card */}
      <Dialog open={removeConfirmOpen} onOpenChange={setRemoveConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>¿Eliminar carta?</DialogTitle>
            <DialogDescription>
              Esta acción eliminará la carta de tu lista. No se afectará tu colección.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRemoveConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleRemoveCard}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
