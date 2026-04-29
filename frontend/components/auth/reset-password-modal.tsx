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
import { resetPassword } from "@/lib/api-client";

interface ResetPasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoginClick?: () => void;
}

export function ResetPasswordModal({ open, onOpenChange, onLoginClick }: ResetPasswordModalProps) {
  const [formData, setFormData] = useState({
    email: "",
    code: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setIsLoading(true);

    try {
      await resetPassword(formData.email, formData.code, formData.password);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al restablecer contraseña");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setFormData({ email: "", code: "", password: "", confirmPassword: "" });
    setError("");
    setSuccess(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nueva contraseña</DialogTitle>
          <DialogDescription>
            Ingresa el código de 6 dígitos que recibiste por email junto con tu nueva contraseña.
          </DialogDescription>
        </DialogHeader>
        {success ? (
          <div className="space-y-4">
            <p className="text-sm text-green-600">✓ Contraseña actualizada correctamente.</p>
            <Button onClick={() => {
              handleClose();
              onLoginClick?.();
            }}>
              Iniciar sesión
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email</Label>
              <Input
                id="reset-email"
                type="email"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={handleChange("email")}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reset-code">Código de 6 dígitos</Label>
              <Input
                id="reset-code"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="123456"
                value={formData.code}
                onChange={handleChange("code")}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">Nueva contraseña</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={formData.password}
                onChange={handleChange("password")}
                required
                disabled={isLoading}
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar contraseña</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Repite tu contraseña"
                value={formData.confirmPassword}
                onChange={handleChange("confirmPassword")}
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
                    Actualizando...
                  </>
                ) : (
                  "Guardar nueva contraseña"
                )}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                ¿Ya tenés cuenta?{" "}
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
