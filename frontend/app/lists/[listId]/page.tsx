import type { Metadata } from "next";
import ListDetailClient from "./list-detail-client";

interface ListDetailPageProps {
  params: Promise<{ listId: string }>;
}

export async function generateMetadata({ params }: ListDetailPageProps): Promise<Metadata> {
  const { listId } = await params;
  return {
    title: "Lista de cartas",
    description: "Explora esta lista de cartas Pokemon TCG.",
  };
}

export default async function ListDetailPage({ params }: ListDetailPageProps) {
  const { listId } = await params;
  return <ListDetailClient listId={listId} />;
}
