"use client";

import { Package, Search, List, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type EmptyStateIcon = "package" | "search" | "list" | "card";

const icons: Record<EmptyStateIcon, typeof Package> = {
  package: Package,
  search: Search,
  list: List,
  card: CreditCard,
};

interface EmptyStateProps {
  icon?: EmptyStateIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  children?: ReactNode;
}

export function EmptyState({
  icon = "package",
  title,
  description,
  action,
  className,
  children,
}: EmptyStateProps) {
  const Icon = icons[icon];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 py-12 text-center",
        className
      )}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="max-w-md text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action && (
        <Button onClick={action.onClick} className="mt-2">
          {action.label}
        </Button>
      )}
      {children}
    </div>
  );
}

// Pre-configured empty states for common use cases

export function NoListsEmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <EmptyState
      icon="list"
      title="Aún no tienes listas"
      description="Crea tu primera lista para empezar a organizar tu colección y compartirla con clientes."
      action={{
        label: "Crear lista",
        onClick: onCreate,
      }}
    />
  );
}

export function NoCardsInListEmptyState({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      icon="card"
      title="Esta lista está vacía"
      description="Agrega cartas desde cualquier set para empezar a armar tu lista."
      action={onAdd ? {
        label: "Explorar sets",
        onClick: onAdd,
      } : undefined}
    />
  );
}

export function NoSearchResultsEmptyState({ query }: { query: string }) {
  return (
    <EmptyState
      icon="search"
      title="Sin resultados"
      description={`No encontramos cartas que coincidan con "${query}". Intenta con otro término.`}
    />
  );
}

export function NoFilterResultsEmptyState({ onClear }: { onClear: () => void }) {
  return (
    <EmptyState
      icon="search"
      title="Sin resultados"
      description="No hay cartas que coincidan con los filtros aplicados."
      action={{
        label: "Limpiar filtros",
        onClick: onClear,
      }}
    />
  );
}

export function NoCollectionCardsEmptyState({ filter }: { filter: string }) {
  const messages: Record<string, { title: string; description: string }> = {
    have: {
      title: "No tienes cartas marcadas",
      description: "Marca las cartas que tengas haciendo clic en las variantes disponibles.",
    },
    need: {
      title: "No tienes cartas necesitadas",
      description: "Marca las cartas que necesites para hacer seguimiento de tu colección.",
    },
    dupe: {
      title: "No tienes duplicadas",
      description: "Las cartas con más de una unidad aparecerán aquí.",
    },
  };

  const content = messages[filter] || {
    title: "Sin cartas",
    description: "No hay cartas para mostrar.",
  };

  return (
    <EmptyState
      icon="card"
      title={content.title}
      description={content.description}
    />
  );
}
