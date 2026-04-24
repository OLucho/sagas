"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import Link from "next/link";
import Image from "next/image";
import { Search, ChevronDown, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SetGridSkeleton } from "@/components/ui/loading-skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { fetchSets, groupSetsBySeries } from "@/lib/pokemon-api";
import type { PokemonSet } from "@/lib/types";
import { cn } from "@/lib/utils";

export function SetsPageClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSeries, setExpandedSeries] = useState<Set<string>>(new Set());

  const { data: sets, error, isLoading, mutate } = useSWR("sets", fetchSets);

  // Group sets by series
  const groupedSets = useMemo(() => {
    if (!sets) return new Map<string, PokemonSet[]>();
    return groupSetsBySeries(sets);
  }, [sets]);

  // Filter sets based on search query
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return groupedSets;

    const query = searchQuery.toLowerCase();
    const filtered = new Map<string, PokemonSet[]>();

    groupedSets.forEach((seriesSets, seriesName) => {
      const matchingSets = seriesSets.filter(
        (set) =>
          set.name.toLowerCase().includes(query) ||
          seriesName.toLowerCase().includes(query)
      );
      if (matchingSets.length > 0) {
        filtered.set(seriesName, matchingSets);
      }
    });

    return filtered;
  }, [groupedSets, searchQuery]);

  // Auto-expand series when searching
  const effectiveExpanded = useMemo(() => {
    if (searchQuery.trim()) {
      return new Set(filteredGroups.keys());
    }
    return expandedSeries;
  }, [searchQuery, filteredGroups, expandedSeries]);

  const toggleSeries = (series: string) => {
    const newExpanded = new Set(expandedSeries);
    if (newExpanded.has(series)) {
      newExpanded.delete(series);
    } else {
      newExpanded.add(series);
    }
    setExpandedSeries(newExpanded);
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Sets y Expansiones</h1>
          <p className="mt-2 text-muted-foreground">
            Cargando sets de Pokemon TCG...
          </p>
        </div>
        <SetGridSkeleton count={12} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Sets y Expansiones</h1>
        </div>
        <ErrorState
          title="Error al cargar sets"
          message="No pudimos cargar los sets de Pokemon TCG. Por favor, intenta de nuevo."
          onRetry={() => mutate()}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Sets y Expansiones</h1>
        <p className="mt-2 text-muted-foreground">
          Explora todos los sets de Pokemon TCG. Haz clic en una serie para ver sus expansiones.
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-8 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar sets..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Empty state for search */}
      {filteredGroups.size === 0 && searchQuery.trim() && (
        <EmptyState
          icon="search"
          title="Sin resultados"
          description={`No encontramos sets que coincidan con "${searchQuery}".`}
          action={{
            label: "Limpiar búsqueda",
            onClick: () => setSearchQuery(""),
          }}
        />
      )}

      {/* Sets grouped by series */}
      <div className="space-y-4">
        {Array.from(filteredGroups.entries()).map(([series, seriesSets]) => {
          const isExpanded = effectiveExpanded.has(series);
          
          return (
            <div key={series} className="overflow-hidden rounded-lg border border-border bg-card">
              {/* Series header - clickable */}
              <button
                onClick={() => toggleSeries(series)}
                className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-secondary/50"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">{series}</h2>
                    <p className="text-sm text-muted-foreground">
                      {seriesSets.length} {seriesSets.length === 1 ? "set" : "sets"}
                    </p>
                  </div>
                </div>
              </button>

              {/* Sets grid - collapsible */}
              <div
                className={cn(
                  "grid gap-3 overflow-hidden border-t border-border p-4 transition-all",
                  "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
                  !isExpanded && "hidden"
                )}
              >
                {seriesSets.map((set) => (
                  <SetCard key={set.id} set={set} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SetCard({ set }: { set: PokemonSet }) {
  const releaseYear = new Date(set.releaseDate).getFullYear();

  return (
    <Link
      href={`/sets/${set.id}`}
      className="group flex items-center gap-3 rounded-lg border border-border bg-secondary/30 p-3 transition-all hover:border-primary/50 hover:bg-secondary/50"
    >
      {/* Set symbol icon */}
      <div className="relative h-8 w-8 shrink-0">
        {set.images?.symbol ? (
          <Image
            src={set.images.symbol}
            alt=""
            fill
            className="object-contain"
            sizes="32px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded bg-muted">
            <span className="text-xs font-medium text-muted-foreground">
              {set.name.charAt(0)}
            </span>
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-medium text-foreground group-hover:text-primary">
          {set.name}
        </h3>
        <p className="text-xs text-muted-foreground">
          {set.printedTotal} cartas • {releaseYear}
        </p>
      </div>
    </Link>
  );
}
