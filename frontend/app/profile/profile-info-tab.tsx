"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { Loader2, Save, User, AtSign, Phone, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { fetchCurrentUser, updateProfile } from "@/lib/api-client";
import { toast } from "@/hooks/use-toast";

export function ProfileInfoTab() {
  const { user, token, updateUser } = useAuth();

  const [username, setUsername] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [instagram, setInstagram] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const {
    data: profile,
    isLoading: profileLoading,
    mutate,
  } = useSWR("current-user", () => fetchCurrentUser(token));

  // Sync form when profile loads
  useEffect(() => {
    if (profile) {
      setUsername(profile.name ?? "");
      setWhatsapp(profile.whatsapp ?? "");
      setInstagram(profile.instagram ?? "");
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const payload: { name?: string; whatsapp?: string; instagram?: string } = {};
      if (username.trim() !== (profile?.name ?? "")) {
        payload.name = username.trim();
      }
      if (whatsapp.trim() !== (profile?.whatsapp ?? "")) {
        payload.whatsapp = whatsapp.trim();
      }
      if (instagram.trim() !== (profile?.instagram ?? "")) {
        payload.instagram = instagram.trim();
      }

      const updated = await updateProfile(payload, token);
      mutate({ ...profile, ...updated }, false);

      if (user) {
        updateUser({
          ...user,
          name: updated.name ?? user.name,
          whatsapp: updated.whatsapp,
          instagram: updated.instagram,
        });
      }

      toast({
        title: "Perfil actualizado",
        description: "Tus cambios fueron guardados correctamente.",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar cambios");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (profileLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Información de perfil
        </CardTitle>
        <CardDescription>
          Estos datos son visibles para tus contactos cuando compartes listas.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="username" className="flex items-center gap-2">
              <AtSign className="h-3.5 w-3.5 text-muted-foreground" />
              Nombre de usuario
            </Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Tu nombre visible"
              minLength={3}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsapp" className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 text-muted-foreground" />
              WhatsApp
            </Label>
            <Input
              id="whatsapp"
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="Ej: +54 9 11 1234-5678"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instagram" className="flex items-center gap-2">
              <Instagram className="h-3.5 w-3.5 text-muted-foreground" />
              Instagram
            </Label>
            <Input
              id="instagram"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="Ej: @tucuenta"
              disabled={isSubmitting}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Guardar cambios
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
