import type { Metadata } from "next";
import { MyListsClient } from "./my-lists-client";

export const metadata: Metadata = {
  title: "Mis Listas",
  description: "Gestiona tus listas de cartas Pokemon. Crea, edita y comparte tus colecciones.",
};

export default function MyListsPage() {
  return <MyListsClient />;
}
