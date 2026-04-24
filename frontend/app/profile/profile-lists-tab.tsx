"use client";

import { useState } from "react";
import useSWR from "swr";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListCard } from "@/components/lists/list-card";
import { CreateListModal } from "@/components/lists/create-list-modal";
import { ListGridSkeleton } from "@/components/ui/loading-skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { NoListsEmptyState } from "@/components/ui/empty-state";
import { useAuth } from "@/lib/auth-context";
import { fetchUserLists, createList } from "@/lib/api-client";

export function ProfileListsTab() {
  const { token } = useAuth();
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const {
    data: lists,
    error,
    isLoading,
    mutate,
  } = useSWR("user-lists", () => fetchUserLists(token));

  const handleCreateList = async (name: string, isPublic: boolean) => {
    const newList = await createList(name, isPublic, token);
    mutate([...(lists || []), newList]);
  };

  if (isLoading) {
    return (
      <div className="py-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Mis Listas</h2>
          </div>
          <Button size="sm" onClick={() => setCreateModalOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Nueva lista
          </Button>
        </div>
        <ListGridSkeleton count={6} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-4">
        <ErrorState
          title="Error al cargar listas"
          message="No pudimos cargar tus listas. Por favor, intenta de nuevo."
          onRetry={() => mutate()}
        />
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Mis Listas</h2>
        <Button size="sm" onClick={() => setCreateModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva lista
        </Button>
      </div>

      {!lists || lists.length === 0 ? (
        <NoListsEmptyState onCreate={() => setCreateModalOpen(true)} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lists.map((list) => (
            <ListCard key={list.id} list={list} />
          ))}
        </div>
      )}

      <CreateListModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSubmit={handleCreateList}
      />
    </>
  );
}
