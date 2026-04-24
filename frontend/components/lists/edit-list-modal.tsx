"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { UserList } from "@/lib/types";

interface EditListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  list: UserList | null;
  onSubmit: (updates: { name?: string; isPublic?: boolean }) => Promise<void>;
}

export function EditListModal({ open, onOpenChange, list, onSubmit }: EditListModalProps) {
  const [name, setName] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Sync state when list changes
  useEffect(() => {
    if (list) {
      setName(list.name);
      setIsPublic(list.isPublic);
    }
  }, [list]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("El nombre es requerido");
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit({ name: name.trim(), isPublic });
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar la lista");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar lista</DialogTitle>
          <DialogDescription>
            Modifica el nombre o visibilidad de tu lista.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-list-name">Nombre de la lista</Label>
            <Input
              id="edit-list-name"
              placeholder="Ej: Cartas en venta - Abril 2024"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="edit-is-public">Lista pública</Label>
              <p className="text-sm text-muted-foreground">
                Las listas públicas pueden ser vistas por cualquiera con el link
              </p>
            </div>
            <Switch
              id="edit-is-public"
              checked={isPublic}
              onCheckedChange={setIsPublic}
              disabled={isLoading}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar cambios"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
