"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListCard } from "@/components/lists/list-card";
import { CreateListModal } from "@/components/lists/create-list-modal";
import { ListGridSkeleton } from "@/components/ui/loading-skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { NoListsEmptyState } from "@/components/ui/empty-state";
import { useAuth } from "@/lib/auth-context";
import { fetchUserLists } from "@/lib/api-client";
import { createList } from "@/lib/api-client";

export function MyListsClient() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, token } = useAuth();
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [authLoading, isAuthenticated, router]);

  const {
    data: lists,
    error,
    isLoading,
    mutate,
  } = useSWR(
    isAuthenticated ? "user-lists" : null,
    () => fetchUserLists(token),
  );

  const handleCreateList = async (name: string, isPublic: boolean) => {
    const newList = await createList(name, isPublic, token);
    mutate([...(lists || []), newList]);
  };

  // Show nothing while checking auth
  if (authLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="h-9 w-48 animate-pulse rounded-md bg-secondary" />
          <div className="mt-2 h-5 w-64 animate-pulse rounded-md bg-secondary" />
        </div>
        <ListGridSkeleton count={6} />
      </div>
    );
  }

  // Not authenticated - will redirect
  if (!isAuthenticated) {
    return null;
  }

  // Loading lists
  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Mis Listas</h1>
            <p className="mt-2 text-muted-foreground">Cargando tus listas...</p>
          </div>
        </div>
        <ListGridSkeleton count={6} />
      </div>
    );
  }

  // Error loading lists
  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Mis Listas</h1>
        </div>
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
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Mis Listas</h1>
            <p className="mt-2 text-muted-foreground">
              Organiza tus cartas en listas y compártelas con tus clientes.
            </p>
          </div>
          <Button onClick={() => setCreateModalOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Nueva lista
          </Button>
        </div>

        {/* Lists grid or empty state */}
        {!lists || lists.length === 0 ? (
          <NoListsEmptyState onCreate={() => setCreateModalOpen(true)} />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {lists.map((list) => (
              <ListCard key={list.id} list={list} />
            ))}
          </div>
        )}
      </div>

      <CreateListModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSubmit={handleCreateList}
      />
    </>
  );
}
