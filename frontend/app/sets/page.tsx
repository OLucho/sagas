import type { Metadata } from "next";
import { SetsPageClient } from "./sets-page-client";

export const metadata: Metadata = {
  title: "Sets y Expansiones",
  description: "Explora todos los sets y expansiones de Pokemon TCG. Desde Base Set hasta las últimas ediciones.",
};

export default function SetsPage() {
  return <SetsPageClient />;
}
