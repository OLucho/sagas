"use client";

import { useState } from "react";
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
import { requestPasswordReset } from "@/lib/api-client";

interface ForgotPasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoginClick?: () => void;
  onResetPasswordClick?: () => void;
}

export function ForgotPasswordModal({ open, onOpenChange, onLoginClick, onResetPasswordClick }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSent(false);
    setIsLoading(true);

    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al enviar el código");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setEmail("");
    setError("");
    setSent(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Recuperar contraseña</DialogTitle>
          <DialogDescription>
            {sent
              ? "Te enviamos un código de 6 dígitos a tu email. Usalo junto con tu email para establecer una nueva contraseña."
              : "Ingresa tu email y te enviaremos un código de recuperación."}
          </DialogDescription>
        </DialogHeader>
        {sent ? (
          <div className="space-y-4">
            <p className="text-sm text-green-600">✓ Código enviado. Revisá tu email.</p>
            <div className="flex flex-col gap-2">
              <Button variant="outline" onClick={() => {
                onOpenChange(false);
                onResetPasswordClick?.();
              }}>Ingresar código</Button>
              <p className="text-center text-xs text-muted-foreground">
                ¿Recordaste tu contraseña?{" "}
                <button
                  type="button"
                  className="text-primary hover:underline"
                  onClick={() => {
                    onOpenChange(false);
                    onLoginClick?.();
                  }}
                >
                  Iniciar sesión
                </button>
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email</Label>
              <Input
                id="reset-email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex flex-col gap-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Enviar código"
                )}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                ¿Recordaste tu contraseña?{" "}
                <button
                  type="button"
                  className="text-primary hover:underline"
                  onClick={() => {
                    onOpenChange(false);
                    onLoginClick?.();
                  }}
                >
                  Iniciar sesión
                </button>
              </p>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
