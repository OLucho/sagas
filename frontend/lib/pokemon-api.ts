import type { PokemonSet, PokemonCard, PokemonTCGResponse, CardVariant } from "./types";

const API_BASE = "https://api.pokemontcg.io/v2";

// Helper to extract available variants from a card's tcgplayer prices
export function getCardVariants(card: PokemonCard): CardVariant[] {
  const variants: CardVariant[] = [];
  
  if (!card.tcgplayer?.prices) {
    // Default to normal if no price data
    return ['normal'];
  }
  
  const priceKeys = Object.keys(card.tcgplayer.prices);
  
  if (priceKeys.includes('normal')) variants.push('normal');
  if (priceKeys.includes('holofoil')) variants.push('holofoil');
  if (priceKeys.includes('reverseHolofoil')) variants.push('reverseHolofoil');
  if (priceKeys.includes('1stEdition')) variants.push('1stEdition');
  if (priceKeys.includes('1stEditionHolofoil')) variants.push('1stEditionHolofoil');
  
  // If no variants found in prices, default to normal
  if (variants.length === 0) {
    variants.push('normal');
  }
  
  return variants;
}

// Fetch all sets
export async function fetchSets(): Promise<PokemonSet[]> {
  const response = await fetch(`${API_BASE}/sets?orderBy=-releaseDate`);
  
  if (!response.ok) {
    throw new Error("Error al cargar los sets");
  }
  
  const data: PokemonTCGResponse<PokemonSet[]> = await response.json();
  return data.data;
}

// Fetch a single set by ID
export async function fetchSet(setId: string): Promise<PokemonSet> {
  const response = await fetch(`${API_BASE}/sets/${setId}`);
  
  if (!response.ok) {
    throw new Error("Set no encontrado");
  }
  
  const data: PokemonTCGResponse<PokemonSet> = await response.json();
  return data.data;
}

// Fetch cards from a set
export async function fetchSetCards(
  setId: string,
  page: number = 1,
  pageSize: number = 250
): Promise<{ cards: PokemonCard[]; totalCount: number }> {
  const response = await fetch(
    `${API_BASE}/cards?q=set.id:${setId}&orderBy=number&page=${page}&pageSize=${pageSize}`
  );
  
  if (!response.ok) {
    throw new Error("Error al cargar las cartas");
  }
  
  const data: PokemonTCGResponse<PokemonCard[]> = await response.json();
  return {
    cards: data.data,
    totalCount: data.totalCount || 0,
  };
}

// Fetch a single card by ID
export async function fetchCard(cardId: string): Promise<PokemonCard> {
  const response = await fetch(`${API_BASE}/cards/${cardId}`);
  
  if (!response.ok) {
    throw new Error("Carta no encontrada");
  }
  
  const data: PokemonTCGResponse<PokemonCard> = await response.json();
  return data.data;
}

// Fetch multiple cards by their IDs using query params
export async function fetchCardsByIds(
  cardIds: string[]
): Promise<{ cards: PokemonCard[]; totalCount: number }> {
  if (cardIds.length === 0) {
    return { cards: [], totalCount: 0 };
  }

  // Build query: id:"card1" OR id:"card2" OR ...
  const query = cardIds.map((id) => `id:"${id}"`).join(' OR ');

  const response = await fetch(
    `${API_BASE}/cards?q=${encodeURIComponent(query)}&pageSize=250`
  );

  if (!response.ok) {
    throw new Error("Error al cargar las cartas");
  }

  const data: PokemonTCGResponse<PokemonCard[]> = await response.json();
  return {
    cards: data.data,
    totalCount: data.totalCount || 0,
  };
}
export async function searchCards(
  query: string,
  setId?: string,
  page: number = 1,
  pageSize: number = 20
): Promise<{ cards: PokemonCard[]; totalCount: number }> {
  let q = `name:${encodeURIComponent(query)}*`;
  if (setId) {
    q += ` set.id:${setId}`;
  }
  const response = await fetch(
    `${API_BASE}/cards?q=${encodeURIComponent(q)}&page=${page}&pageSize=${pageSize}`
  );
  
  if (!response.ok) {
    throw new Error("Error en la búsqueda");
  }
  
  const data: PokemonTCGResponse<PokemonCard[]> = await response.json();
  return {
    cards: data.data,
    totalCount: data.totalCount || 0,
  };
}

// Group sets by series
export function groupSetsBySeries(sets: PokemonSet[]): Map<string, PokemonSet[]> {
  const grouped = new Map<string, PokemonSet[]>();
  
  for (const set of sets) {
    const series = set.series;
    if (!grouped.has(series)) {
      grouped.set(series, []);
    }
    grouped.get(series)!.push(set);
  }
  
  return grouped;
}

// Get unique types from cards
export function getUniqueTypes(cards: PokemonCard[]): string[] {
  const types = new Set<string>();
  cards.forEach(card => {
    card.types?.forEach(type => types.add(type));
  });
  return Array.from(types).sort();
}

// Get unique rarities from cards
export function getUniqueRarities(cards: PokemonCard[]): string[] {
  const rarities = new Set<string>();
  cards.forEach(card => {
    if (card.rarity) rarities.add(card.rarity);
  });
  return Array.from(rarities).sort();
}

// Get unique supertypes from cards
export function getUniqueSupertypes(cards: PokemonCard[]): string[] {
  const supertypes = new Set<string>();
  cards.forEach(card => {
    supertypes.add(card.supertype);
  });
  return Array.from(supertypes).sort();
}
