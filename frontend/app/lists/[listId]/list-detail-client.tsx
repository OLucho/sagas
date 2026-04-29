"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Share2,
  Pencil,
  Check,
  Globe,
  Lock,
  Plus,
  Loader2,
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
import { fetchList, fetchListCards, removeCardFromList } from "@/lib/api-client";
import { fetchCardsByIds } from "@/lib/pokemon-api";
import type {
  UserList,
  CollectionFilter,
  CardFilters,
  CardVariant,
  CollectionCard,
  PokemonCard,
} from "@/lib/types";
import { toast } from "@/hooks/use-toast";

import useSWR from "swr";

interface CombinedListData {
  list: UserList;
  cards: PokemonCard[];
  collectionRecord: Record<string, CollectionCard>;
  listCardIds: string[];
}

export default function ListDetailClient({ listId }: { listId: string }) {
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
  const [isRemoving, setIsRemoving] = useState(false);
  const [updatingVariantCardId, setUpdatingVariantCardId] = useState<string | null>(null);

  const {
    data: combined,
    error,
    isLoading,
    isValidating,
    mutate: mutateCombined,
  } = useSWR<CombinedListData | null>(
    [`list-detail`, listId, token],
    async () => {
      const list = await fetchList(listId, token);
      if (!list) return null;

      const entries = await fetchListCards(listId, token);
      const cardIds = entries.map((e) => e.cardId);
      const pokemonCards =
        cardIds.length > 0
          ? await fetchCardsByIds(cardIds).then((r) => r.cards)
          : [];

      const pokemonCardsById = new Map(pokemonCards.map((c) => [c.id, c]));
      const collectionRecord: Record<string, CollectionCard> = {};
      entries.forEach((entry) => {
        const total = Object.values(entry.variants).reduce((a, b) => a + b, 0);
        collectionRecord[entry.cardId] = {
          cardId: entry.cardId,
          availableVariants: Object.keys(entry.variants) as CardVariant[],
          userVariants: entry.variants,
          status: total > 0 ? "have" : "none",
        };
      });

      const cards = entries
        .map((entry) => pokemonCardsById.get(entry.cardId))
        .filter(Boolean) as PokemonCard[];

      return {
        list,
        cards,
        collectionRecord,
        listCardIds: cardIds,
      };
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
    }
  );

  const list = combined?.list ?? null;
  const listCards = combined?.cards ?? [];
  const collectionRecord = combined?.collectionRecord ?? {};
  const listCardIds = combined?.listCardIds ?? [];

  const isOwner = isAuthenticated && user && list && list.userId === user.id;
  const hasAccess = list?.isPublic || isOwner;

  const availableTypes = useMemo(() => {
    const s = new Set<string>();
    listCards.forEach((c) => c.types?.forEach((t) => s.add(t)));
    return Array.from(s).sort();
  }, [listCards]);

  const availableRarities = useMemo(() => {
    const s = new Set<string>();
    listCards.forEach((c) => { if (c.rarity) s.add(c.rarity); });
    return Array.from(s).sort();
  }, [listCards]);

  const availableSupertypes = useMemo(() => {
    const s = new Set<string>();
    listCards.forEach((c) => s.add(c.supertype));
    return Array.from(s).sort();
  }, [listCards]);

  const filteredCards = useMemo(() => {
    return listCards.filter((card) => {
      if (cardFilters.search) {
        const q = cardFilters.search.toLowerCase();
        if (!card.name.toLowerCase().includes(q) && !card.number.includes(q)) return false;
      }
      if (cardFilters.types.length > 0 && !card.types?.some((t) => cardFilters.types.includes(t))) return false;
      if (cardFilters.rarity.length > 0 && (!card.rarity || !cardFilters.rarity.includes(card.rarity))) return false;
      if (cardFilters.supertype.length > 0 && !cardFilters.supertype.includes(card.supertype)) return false;
      return true;
    });
  }, [listCards, cardFilters]);

  const collectionCounts = useMemo(() => {
    let have = 0;
    let dupe = 0;
    filteredCards.forEach((card) => {
      const data = collectionRecord[card.id];
      const total = data ? Object.values(data.userVariants).reduce((a, b) => a + b, 0) : 0;
      if (total > 0) have++;
      if (total > 1) dupe++;
    });
    return { all: filteredCards.length, have, need: filteredCards.length - have, dupe };
  }, [filteredCards, collectionRecord]);

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/lists/${listId}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRemoveCard = async () => {
    if (!removingCardId || !token) return;
    setIsRemoving(true);
    try {
      await removeCardFromList(listId, removingCardId, token);
      mutateCombined();
      toast({ title: "Carta eliminada de la lista" });
    } catch (err: any) {
      toast({ title: "Error al eliminar", description: err.message, variant: "destructive" });
    } finally {
      setIsRemoving(false);
      setRemoveConfirmOpen(false);
      setRemovingCardId(null);
    }
  };

  const handleVariantChange = useCallback(
    async (cardId: string, variant: CardVariant, quantity: number) => {
      const entry = Object.values(collectionRecord).find((e) => e.cardId === cardId);
      if (!entry || !token) return;

      const nextVariants = { ...entry.userVariants };
      if (quantity > 0) nextVariants[variant] = quantity;
      else delete nextVariants[variant];

      setUpdatingVariantCardId(cardId);

      // Optimistic update
      mutateCombined(
        (current) => {
          if (!current) return current;
          return {
            ...current,
            collectionRecord: {
              ...current.collectionRecord,
              [cardId]: {
                ...current.collectionRecord[cardId],
                userVariants: nextVariants,
                status: Object.values(nextVariants).reduce((a, b) => a + b, 0) > 0 ? "have" : "none",
              },
            },
          };
        },
        { revalidate: false }
      );

      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"}/lists/${listId}/cards/${cardId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ variants: nextVariants }),
        });
      } catch (_e) {
        mutateCombined();
        toast({ title: "Error al guardar", description: "No se pudo actualizar la carta", variant: "destructive" });
      } finally {
        setUpdatingVariantCardId(null);
      }
    },
    [collectionRecord, token, mutateCombined, listId]
  );

  const clearFilters = () => {
    setCardFilters({ search: "", types: [], rarity: [], supertype: [] });
    setCollectionFilter("all");
  };

  if (isLoading) {
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

  if (error) {
    const msg = error instanceof Error ? error.message : "";
    if (msg.includes("permisos") || msg.includes("privada") || msg.includes("401") || msg.includes("403")) {
      return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <ForbiddenState title="Lista privada" message="Esta lista es privada y solo puede ser vista por su creador." />
        </div>
      );
    }
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <ErrorState title="Error al cargar lista" message={msg || "No pudimos cargar la lista."} onRetry={() => mutateCombined()} />
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

  if (!hasAccess) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <ForbiddenState title="Lista privada" message="Esta lista es privada y solo puede ser vista por su creador." />
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
        {isOwner && (
          <Button asChild variant="ghost" className="mb-4 gap-2">
            <Link href="/my-lists">
              <ChevronLeft className="h-4 w-4" />
              Mis listas
            </Link>
          </Button>
        )}

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{list.name}</h1>
              <div
                className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                  list.isPublic ? "bg-success/10 text-success" : "bg-secondary text-muted-foreground"
                }`}
              >
                {list.isPublic ? <><Globe className="h-3 w-3" /> Pública</> : <><Lock className="h-3 w-3" /> Privada</>}
              </div>
              {isValidating && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Actualizando...
                </span>
              )}
            </div>
            <p className="mt-2 text-muted-foreground">
              {listCards.length} {listCards.length === 1 ? "carta" : "cartas"} • Creada el {createdDate}
              {updatedDate !== createdDate && ` • Actualizada el ${updatedDate}`}
            </p>
          </div>

          {isOwner && (
            <div className="flex gap-2">
              {list.isPublic && (
                <Button variant="outline" onClick={handleCopyLink} className="gap-2">
                  {copied ? <><Check className="h-4 w-4" /> Copiado</> : <><Share2 className="h-4 w-4" /> Compartir</>}
                </Button>
              )}
              <Button variant="outline" onClick={() => setEditModalOpen(true)}>
                <Pencil className="mr-2 h-4 w-4" /> Editar
              </Button>
              <Button onClick={() => setAddCardsModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Agregar cartas
              </Button>
            </div>
          )}
        </div>

        {listCards.length === 0 && (
          <EmptyState
            icon="card"
            title="Sin cartas"
            description="Esta lista aún no tiene cartas."
            action={isOwner ? { label: "Agregar cartas", onClick: () => setAddCardsModalOpen(true) } : undefined}
          />
        )}

        {listCards.length > 0 && (
          <>
            <CollectionTabs
              activeFilter={collectionFilter}
              onFilterChange={setCollectionFilter}
              counts={collectionCounts}
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
              isAuthenticated={isOwner || false}
              variantUpdatingCardId={updatingVariantCardId}
              filter={collectionFilter}
              searchQuery={cardFilters.search}
              onCardClick={setSelectedCard}
              onVariantChange={handleVariantChange}
              onRemoveCardClick={(cardId) => {
                setRemovingCardId(cardId);
                setRemoveConfirmOpen(true);
              }}
              onClearFilters={clearFilters}
            />
          </>
        )}
      </div>

      {selectedCard && (
        <CardDetailModal
          card={selectedCard}
          collectionData={collectionRecord[selectedCard.id]}
          isAuthenticated={isOwner || false}
          onClose={() => setSelectedCard(null)}
          onVariantChange={handleVariantChange}
        />
      )}

      {isOwner && (
        <>
          <EditListModal
            open={editModalOpen}
            onOpenChange={setEditModalOpen}
            list={list}
            onSubmit={async () => {
              mutateCombined();
              setEditModalOpen(false);
            }}
          />

          <AddCardsModal
            open={addCardsModalOpen}
            onOpenChange={setAddCardsModalOpen}
            listId={listId}
            existingCardIds={new Set(listCardIds)}
            onCardsAdded={() => {
              mutateCombined();
              setAddCardsModalOpen(false);
            }}
          />
        </>
      )}

      <Dialog open={removeConfirmOpen} onOpenChange={setRemoveConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>¿Eliminar carta?</DialogTitle>
            <DialogDescription>Esta acción eliminará la carta de tu lista. No se afectará tu colección.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRemoveConfirmOpen(false)} disabled={isRemoving}>Cancelar</Button>
            <Button variant="destructive" onClick={handleRemoveCard} disabled={isRemoving}>
              {isRemoving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                "Eliminar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
