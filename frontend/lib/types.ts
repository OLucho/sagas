// Pokemon TCG API Types
export interface PokemonSet {
  id: string;
  name: string;
  series: string;
  printedTotal: number;
  total: number;
  releaseDate: string;
  updatedAt: string;
  images: {
    symbol: string;
    logo: string;
  };
}

export interface PokemonCard {
  id: string;
  name: string;
  supertype: string;
  subtypes?: string[];
  hp?: string;
  types?: string[];
  evolvesFrom?: string;
  evolvesTo?: string[];
  rules?: string[];
  attacks?: {
    name: string;
    cost: string[];
    convertedEnergyCost: number;
    damage: string;
    text: string;
  }[];
  weaknesses?: {
    type: string;
    value: string;
  }[];
  resistances?: {
    type: string;
    value: string;
  }[];
  retreatCost?: string[];
  convertedRetreatCost?: number;
  set: PokemonSet;
  number: string;
  artist?: string;
  rarity?: string;
  flavorText?: string;
  nationalPokedexNumbers?: number[];
  legalities?: {
    unlimited?: string;
    standard?: string;
    expanded?: string;
  };
  images: {
    small: string;
    large: string;
  };
  tcgplayer?: {
    url: string;
    updatedAt: string;
    prices?: Record<string, {
      low?: number;
      mid?: number;
      high?: number;
      market?: number;
      directLow?: number;
    }>;
  };
}

// Variant types - from Pokemon TCG API tcgplayer prices
export type CardVariant = 
  | 'normal'
  | 'holofoil'
  | 'reverseHolofoil'
  | '1stEdition'
  | '1stEditionHolofoil';

// User collection types
export interface UserCardVariants {
  [variant: string]: number; // quantity per variant
}

export interface CollectionCard {
  cardId: string;
  availableVariants: CardVariant[];
  userVariants: UserCardVariants;
  status: 'have' | 'need' | 'none';
}

// List types
export interface UserList {
  id: string;
  name: string;
  isPublic: boolean;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  cardCount: number;
}

export interface ListCard {
  cardId: string;
  card: PokemonCard;
  variants: UserCardVariants;
  addedAt: string;
}

// User types
export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  whatsapp?: string;
  instagram?: string;
}

// API Response types
export interface PokemonTCGResponse<T> {
  data: T;
  page?: number;
  pageSize?: number;
  count?: number;
  totalCount?: number;
}

// Filter types
export type CollectionFilter = 'all' | 'have' | 'need' | 'dupe';

export interface CardFilters {
  search: string;
  types: string[];
  rarity: string[];
  supertype: string[];
}
