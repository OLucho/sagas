"use client";

import { useState, useMemo, useCallback } from "react";
import useSWR from "swr";
import Image from "next/image";
import { X, Search, Plus, Check, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CardGridSkeleton } from "@/components/ui/loading-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { searchCards, fetchSets } from "@/lib/pokemon-api";
import { cn } from "@/lib/utils";
import type { PokemonCard, PokemonSet } from "@/lib/types";

interface AddCardsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddCard: (card: PokemonCard) => Promise<void>;
  existingCardIds?: Set<string>;
}

export function AddCardsModal({
  open,
  onOpenChange,
  onAddCard,
  existingCardIds = new Set(),
}: AddCardsModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSet, setSelectedSet] = useState<string>("all");
  const [addingCardId, setAddingCardId] = useState<string | null>(null);
  const [addedCards, setAddedCards] = useState<Set<string>>(new Set());

  // Fetch all sets for the dropdown
  const { data: sets } = useSWR<PokemonSet[]>("all-sets", fetchSets);

  // Search cards
  const {
    data: searchResults,
    isLoading: searching,
  } = useSWR(
    searchQuery.length >= 2 ? `search-${searchQuery}-${selectedSet}` : null,
    () => searchCards(searchQuery, selectedSet !== "all" ? selectedSet : undefined),
    { revalidateOnFocus: false }
  );

  const cards = searchResults?.cards || [];

  const handleAddCard = useCallback(async (card: PokemonCard) => {
    if (addingCardId || existingCardIds.has(card.id) || addedCards.has(card.id)) return;
    
    setAddingCardId(card.id);
    try {
      await onAddCard(card);
      setAddedCards((prev) => new Set(prev).add(card.id));
    } finally {
      setAddingCardId(null);
    }
  }, [addingCardId, existingCardIds, addedCards, onAddCard]);

  const handleClose = () => {
    onOpenChange(false);
    // Reset state after animation
    setTimeout(() => {
      setSearchQuery("");
      setSelectedSet("all");
      setAddedCards(new Set());
    }, 200);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-hidden p-0">
        <DialogHeader className="border-b border-border px-6 py-4">
          <DialogTitle className="text-xl">Agregar cartas a la lista</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 p-6 pb-4">
          {/* Search and filters */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={selectedSet} onValueChange={setSelectedSet}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Todos los sets" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los sets</SelectItem>
                {sets?.map((set) => (
                  <SelectItem key={set.id} value={set.id}>
                    {set.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Search hint */}
          {searchQuery.length < 2 && (
            <p className="text-center text-sm text-muted-foreground">
              Escribe al menos 2 caracteres para buscar
            </p>
          )}
        </div>

        {/* Results */}
        <div className="max-h-[50vh] overflow-y-auto px-6 pb-6">
          {searching && <CardGridSkeleton count={8} />}

          {!searching && searchQuery.length >= 2 && cards.length === 0 && (
            <EmptyState
              icon="search"
              title="Sin resultados"
              description={`No se encontraron cartas para "${searchQuery}"`}
            />
          )}

          {!searching && cards.length > 0 && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {cards.map((card) => {
                const isExisting = existingCardIds.has(card.id);
                const isAdded = addedCards.has(card.id);
                const isAdding = addingCardId === card.id;
                const isDisabled = isExisting || isAdded || isAdding;

                return (
                  <div
                    key={card.id}
                    className={cn(
                      "group relative flex flex-col rounded-lg p-2 transition-colors",
                      !isDisabled && "cursor-pointer hover:bg-secondary/50",
                      isDisabled && "opacity-60"
                    )}
                    onClick={() => !isDisabled && handleAddCard(card)}
                  >
                    <div className="relative aspect-[2.5/3.5] w-full overflow-hidden rounded-lg">
                      <Image
                        src={card.images.small}
                        alt={card.name}
                        fill
                        className="object-contain"
                        sizes="(max-width: 640px) 40vw, 20vw"
                      />
                      
                      {/* Overlay for added/existing cards */}
                      {(isAdded || isExisting) && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500">
                            <Check className="h-6 w-6 text-white" />
                          </div>
                        </div>
                      )}

                      {/* Adding spinner */}
                      {isAdding && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      )}

                      {/* Add button on hover */}
                      {!isDisabled && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/0 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <Plus className="h-6 w-6" />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-2">
                      <h4 className="truncate text-sm font-medium">{card.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        #{card.number} • {card.set.name}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {addedCards.size > 0 && (
                <span className="text-success">
                  {addedCards.size} carta{addedCards.size !== 1 && "s"} agregada{addedCards.size !== 1 && "s"}
                </span>
              )}
            </p>
            <Button variant="outline" onClick={handleClose}>
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
