"use client";

import Link from "next/link";
import { Globe, Lock, CreditCard, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserList } from "@/lib/types";

interface ListCardProps {
  list: UserList;
  className?: string;
}

export function ListCard({ list, className }: ListCardProps) {
  const formattedDate = new Date(list.updatedAt).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <Link
      href={`/lists/${list.id}`}
      className={cn(
        "group flex flex-col rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/50 hover:bg-card/80",
        className
      )}
    >
      <div className="mb-3 flex items-start justify-between">
        <h3 className="text-lg font-semibold text-foreground group-hover:text-primary">
          {list.name}
        </h3>
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

      <div className="mt-auto flex items-center gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <CreditCard className="h-4 w-4" />
          {list.cardCount} {list.cardCount === 1 ? "carta" : "cartas"}
        </span>
        <span className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          {formattedDate}
        </span>
      </div>
    </Link>
  );
}
