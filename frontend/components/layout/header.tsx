"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, User, LogOut, List, Layers, Settings } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { LoginModal } from "@/components/auth/login-modal";
import { SignupModal } from "@/components/auth/signup-modal";
import { ForgotPasswordModal } from "@/components/auth/forgot-password-modal";
import { ResetPasswordModal } from "@/components/auth/reset-password-modal";

const navigation = [
  { name: "Sets", href: "/sets", icon: Layers },
  { name: "Mis Listas", href: "/my-lists", icon: List, requiresAuth: true },
];

export function Header() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [signupModalOpen, setSignupModalOpen] = useState(false);
  const [forgotPasswordModalOpen, setForgotPasswordModalOpen] = useState(false);
  const [resetPasswordModalOpen, setResetPasswordModalOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-lg font-bold text-primary-foreground">S</span>
            </div>
            <span className="text-xl font-bold text-foreground">Sagas</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-1 md:flex">
            {navigation.map((item) => {
              if (item.requiresAuth && !isAuthenticated) return null;
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Desktop Auth */}
          <div className="hidden items-center gap-3 md:flex">
            {isLoading ? (
              <div className="h-9 w-20 animate-pulse rounded-md bg-secondary" />
            ) : isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary">
                      <User className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <span className="max-w-[100px] truncate">{user?.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Mi Perfil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/my-lists" className="flex items-center gap-2">
                      <List className="h-4 w-4" />
                      Mis Listas
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="gap-2 text-destructive">
                    <LogOut className="h-4 w-4" />
                    Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" onClick={() => setLoginModalOpen(true)}>
                  Iniciar sesión
                </Button>
                <Button onClick={() => setSignupModalOpen(true)}>
                  Registrarse
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </nav>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="border-t border-border md:hidden">
            <div className="space-y-1 px-4 py-3">
              {navigation.map((item) => {
                if (item.requiresAuth && !isAuthenticated) return null;
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-secondary text-foreground"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
              
              <div className="border-t border-border pt-3">
                {isAuthenticated ? (
                  <>
                    <Link
                      href="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    >
                      <Settings className="h-4 w-4" />
                      Mi Perfil
                    </Link>
                    <Link
                      href="/my-lists"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    >
                      <List className="h-4 w-4" />
                      Mis Listas
                    </Link>
                    <div className="mb-2 mt-2 flex items-center gap-2 px-3 py-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                        <User className="h-4 w-4 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{user?.name}</p>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-2 text-destructive"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4" />
                      Cerrar sesión
                    </Button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Button
                      className="w-full"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setLoginModalOpen(true);
                      }}
                    >
                      Iniciar sesión
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setSignupModalOpen(true);
                      }}
                    >
                      Registrarse
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <LoginModal
        open={loginModalOpen}
        onOpenChange={setLoginModalOpen}
        onSignupClick={() => setSignupModalOpen(true)}
        onForgotPasswordClick={() => setForgotPasswordModalOpen(true)}
      />
      <SignupModal open={signupModalOpen} onOpenChange={setSignupModalOpen} onLoginClick={() => setLoginModalOpen(true)} />
      <ForgotPasswordModal
        open={forgotPasswordModalOpen}
        onOpenChange={setForgotPasswordModalOpen}
        onLoginClick={() => setLoginModalOpen(true)}
        onResetPasswordClick={() => setResetPasswordModalOpen(true)}
      />
      <ResetPasswordModal
        open={resetPasswordModalOpen}
        onOpenChange={setResetPasswordModalOpen}
        onLoginClick={() => setLoginModalOpen(true)}
      />
    </>
  );
}
