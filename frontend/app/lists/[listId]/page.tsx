import type { Metadata } from "next";
import { ListDetailClient } from "./list-detail-client";

interface ListDetailPageProps {
  params: Promise<{ listId: string }>;
}

export async function generateMetadata({ params }: ListDetailPageProps): Promise<Metadata> {
  const { listId } = await params;
  
  // In a real app, you'd fetch the list here to get its name
  // For now, we'll use a generic title
  return {
    title: "Lista de cartas",
    description: "Explora esta lista de cartas Pokemon TCG.",
  };
}

export default async function ListDetailPage({ params }: ListDetailPageProps) {
  const { listId } = await params;
  return <ListDetailClient listId={listId} />;
}
