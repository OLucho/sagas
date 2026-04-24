"use client";

import { useState } from "react";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { CardFilters } from "@/lib/types";

interface CardFiltersProps {
  filters: CardFilters;
  onFiltersChange: (filters: CardFilters) => void;
  availableTypes: string[];
  availableRarities: string[];
  availableSupertypes: string[];
  className?: string;
}

export function CardFiltersBar({
  filters,
  onFiltersChange,
  availableTypes,
  availableRarities,
  availableSupertypes,
  className,
}: CardFiltersProps) {
  const activeFilterCount =
    filters.types.length + filters.rarity.length + filters.supertype.length;

  const updateFilter = <K extends keyof CardFilters>(
    key: K,
    value: CardFilters[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = (
    key: "types" | "rarity" | "supertype",
    value: string
  ) => {
    const current = filters[key];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    updateFilter(key, updated);
  };

  const clearAllFilters = () => {
    onFiltersChange({
      search: "",
      types: [],
      rarity: [],
      supertype: [],
    });
  };

  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      {/* Search */}
      <div className="relative flex-1 min-w-[200px] max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar carta..."
          value={filters.search}
          onChange={(e) => updateFilter("search", e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filter dropdowns */}
      <div className="flex flex-wrap gap-2">
        {/* Type filter */}
        {availableTypes.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                Tipo
                {filters.types.length > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                    {filters.types.length}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="max-h-64 overflow-y-auto">
              <DropdownMenuLabel>Tipo de Pokemon</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {availableTypes.map((type) => (
                <DropdownMenuCheckboxItem
                  key={type}
                  checked={filters.types.includes(type)}
                  onCheckedChange={() => toggleArrayFilter("types", type)}
                >
                  {type}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Rarity filter */}
        {availableRarities.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                Rareza
                {filters.rarity.length > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                    {filters.rarity.length}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="max-h-64 overflow-y-auto">
              <DropdownMenuLabel>Rareza</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {availableRarities.map((rarity) => (
                <DropdownMenuCheckboxItem
                  key={rarity}
                  checked={filters.rarity.includes(rarity)}
                  onCheckedChange={() => toggleArrayFilter("rarity", rarity)}
                >
                  {rarity}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Supertype filter */}
        {availableSupertypes.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                Categoría
                {filters.supertype.length > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                    {filters.supertype.length}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Categoría</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {availableSupertypes.map((supertype) => (
                <DropdownMenuCheckboxItem
                  key={supertype}
                  checked={filters.supertype.includes(supertype)}
                  onCheckedChange={() => toggleArrayFilter("supertype", supertype)}
                >
                  {supertype}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Clear filters */}
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="gap-1 text-muted-foreground"
          >
            <X className="h-4 w-4" />
            Limpiar
          </Button>
        )}
      </div>
    </div>
  );
}
