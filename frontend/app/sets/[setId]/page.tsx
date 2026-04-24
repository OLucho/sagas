import type { Metadata } from "next";
import { fetchSet } from "@/lib/pokemon-api";
import { SetDetailClient } from "./set-detail-client";

interface SetDetailPageProps {
  params: Promise<{ setId: string }>;
}

export async function generateMetadata({ params }: SetDetailPageProps): Promise<Metadata> {
  const { setId } = await params;
  
  try {
    const set = await fetchSet(setId);
    return {
      title: set.name,
      description: `Explora las ${set.printedTotal} cartas de ${set.name}. Gestiona tu colección y marca las variantes que tienes.`,
    };
  } catch {
    return {
      title: "Set no encontrado",
      description: "El set que buscas no existe.",
    };
  }
}

export default async function SetDetailPage({ params }: SetDetailPageProps) {
  const { setId } = await params;
  return <SetDetailClient setId={setId} />;
}
