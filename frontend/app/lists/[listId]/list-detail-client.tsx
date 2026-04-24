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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CardGrid } from "@/components/cards/card-grid";
import { CollectionTabs } from "@/components/cards/collection-tabs";
import { CardFiltersBar } from "@/components/cards/card-filters";
import { EditListModal } from "@/components/lists/edit-list-modal";
import { DeleteListDialog } from "@/components/lists/delete-list-dialog";
import { ListGridSkeleton } from "@/components/ui/loading-skeleton";
import { ErrorState, NotFoundState, ForbiddenState } from "@/components/ui/error-state";
import { NoCardsInListEmptyState } from "@/components/ui/empty-state";
import { useAuth } from "@/lib/auth-context";
import { fetchList, fetchListCards, updateList, deleteList } from "@/lib/api-client";
import type { UserList, ListCard, CollectionFilter, CardFilters, CardVariant, CollectionCard, PokemonCard } from "@/lib/types";
import { getUniqueTypes, getUniqueRarities, getUniqueSupertypes } from "@/lib/pokemon-api";
import { cn } from "@/lib/utils";

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
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Fetch list info
  const {
    data: list,
    error: listError,
    isLoading: listLoading,
    mutate: mutateList,
  } = useSWR<UserList | null>(`list-${listId}`, () => fetchList(listId, token));

  // Fetch list cards
  const {
    data: listCards,
    error: cardsError,
    isLoading: cardsLoading,
    mutate: mutateCards,
  } = useSWR<ListCard[]>(`list-cards-${listId}`, () => fetchListCards(listId, token));

  // Check if current user is the owner
  const isOwner = isAuthenticated && user && list && list.ownerId === user.id;

  // Check access permissions
  const hasAccess = list?.isPublic || isOwner;

  // Extract cards from list cards
  const cards: PokemonCard[] = useMemo(() => {
    return listCards?.map((lc) => lc.card).filter(Boolean) || [];
  }, [listCards]);

  // Create collection record from list cards
  const collectionRecord = useMemo(() => {
    const record: Record<string, CollectionCard> = {};
    listCards?.forEach((lc) => {
      record[lc.cardId] = {
        cardId: lc.cardId,
        availableVariants: Object.keys(lc.variants) as CardVariant[],
        userVariants: lc.variants,
        status: Object.values(lc.variants).some((v) => v > 0) ? "have" : "none",
      };
    });
    return record;
  }, [listCards]);

  // Extract filter options
  const availableTypes = useMemo(() => getUniqueTypes(cards), [cards]);
  const availableRarities = useMemo(() => getUniqueRarities(cards), [cards]);
  const availableSupertypes = useMemo(() => getUniqueSupertypes(cards), [cards]);

  // Apply filters
  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      if (cardFilters.search) {
        const query = cardFilters.search.toLowerCase();
        if (!card.name.toLowerCase().includes(query) && !card.number.includes(query)) {
          return false;
        }
      }
      if (cardFilters.types.length > 0) {
        if (!card.types?.some((t) => cardFilters.types.includes(t))) {
          return false;
        }
      }
      if (cardFilters.rarity.length > 0) {
        if (!card.rarity || !cardFilters.rarity.includes(card.rarity)) {
          return false;
        }
      }
      if (cardFilters.supertype.length > 0) {
        if (!cardFilters.supertype.includes(card.supertype)) {
          return false;
        }
      }
      return true;
    });
  }, [cards, cardFilters]);

  // Handlers
  const handleEditList = async (updates: { name?: string; isPublic?: boolean }) => {
    await updateList(listId, updates, token);
    mutateList();
  };

  const handleDeleteList = async () => {
    await deleteList(listId, token);
    router.push("/my-lists");
  };

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/lists/${listId}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearFilters = () => {
    setCardFilters({
      search: "",
      types: [],
      rarity: [],
      supertype: [],
    });
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

  // Not found
  if (listError || !list) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <NotFoundState
          title="Lista no encontrada"
          message="La lista que buscas no existe o fue eliminada."
        />
      </div>
    );
  }

  // No access (private list, not owner)
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

  // Error loading cards
  if (cardsError) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <ErrorState
          title="Error al cargar cartas"
          message="No pudimos cargar las cartas de esta lista."
          onRetry={() => mutateCards()}
        />
      </div>
    );
  }

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
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                {list.name}
              </h1>
              <div
                className={cn(
                  "flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium",
                  list.isPublic
                    ? "bg-success/10 text-success"
                    : "bg-secondary text-muted-foreground"
                )}
              >
                {list.isPublic ? (
                  <>
                    <Globe className="h-3 w-3" />
                    Pública
                  </>
                ) : (
                  <>
                    <Lock className="h-3 w-3" />
                    Privada
                  </>
                )}
              </div>
            </div>
            <p className="mt-2 text-muted-foreground">
              {list.cardCount} {list.cardCount === 1 ? "carta" : "cartas"} •
              Actualizada el{" "}
              {new Date(list.updatedAt).toLocaleDateString("es-AR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>

          {/* Actions - only for owner */}
          {isOwner && (
            <div className="flex gap-2">
              {list.isPublic && (
                <Button
                  variant="outline"
                  onClick={handleCopyLink}
                  className="gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Share2 className="h-4 w-4" />
                      Compartir
                    </>
                  )}
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">Opciones</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setEditModalOpen(true)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Editar lista
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/sets">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Agregar cartas
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setDeleteDialogOpen(true)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar lista
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        {/* Empty state */}
        {(!listCards || listCards.length === 0) && !cardsLoading && (
          <NoCardsInListEmptyState
            onAdd={isOwner ? () => router.push("/sets") : undefined}
          />
        )}

        {/* Content */}
        {listCards && listCards.length > 0 && (
          <>
            {/* Collection tabs - only for owner */}
            {isOwner && (
              <CollectionTabs
                activeFilter={collectionFilter}
                onFilterChange={setCollectionFilter}
                counts={{
                  all: filteredCards.length,
                  have: filteredCards.length,
                  need: 0,
                  dupe: Object.keys(collectionRecord).length,
                }}
                className="mb-6"
              />
            )}

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
              isLoading={cardsLoading}
              filter={collectionFilter}
              searchQuery={cardFilters.search}
              onClearFilters={clearFilters}
              showVariantSelector={false}
            />
          </>
        )}
      </div>

      {/* Modals */}
      {isOwner && (
        <>
          <EditListModal
            open={editModalOpen}
            onOpenChange={setEditModalOpen}
            list={list}
            onSubmit={handleEditList}
          />
          <DeleteListDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            list={list}
            onConfirm={handleDeleteList}
          />
        </>
      )}
    </>
  );
}
