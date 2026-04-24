"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import useSWR from "swr";
import { Loader2, User, ListChecks, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { ProfileInfoTab } from "./profile-info-tab";
import { ProfileListsTab } from "./profile-lists-tab";
import { ProfileCollectionTab } from "./profile-collection-tab";

type ProfileTab = "info" | "lists" | "collection";

const tabs: { value: ProfileTab; label: string; icon: typeof User }[] = [
  { value: "info", label: "Información", icon: User },
  { value: "lists", label: "Mis Listas", icon: ListChecks },
  { value: "collection", label: "Mi Colección", icon: CreditCard },
];

export function ProfileClient() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<ProfileTab>("info");

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-5xl items-center justify-center px-4 py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Mi Perfil</h1>
        <p className="mt-2 text-muted-foreground">
          Gestiona tu información, listas y colección de cartas.
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-8 border-b border-border">
        <div className="flex gap-6">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.value;
            const Icon = tab.icon;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  "relative inline-flex items-center gap-2 pb-3 text-sm font-medium transition-colors",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                {isActive && (
                  <span className="absolute -bottom-[1px] left-0 right-0 h-0.5 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      <div>
        {activeTab === "info" && <ProfileInfoTab />}
        {activeTab === "lists" && <ProfileListsTab />}
        {activeTab === "collection" && <ProfileCollectionTab />}
      </div>
    </div>
  );
}
