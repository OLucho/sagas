import { InvalidCardIdException } from '../../domain/exceptions/invalid-card-id.exception';
import { InvalidSetIdException } from '../../domain/exceptions/invalid-set-id.exception';

export interface CreateCollectionCardParams {
  id: string;
  userId: string;
  cardId: string;
  setId: string;
  variants: Record<string, number>;
  needed: boolean;
}

export interface ReconstructCollectionCardParams {
  id: string;
  userId: string;
  cardId: string;
  setId: string;
  variants: Record<string, number>;
  needed: boolean;
}

export class CollectionCard {
  private readonly _id: string;
  private readonly _userId: string;
  private readonly _cardId: string;
  private readonly _setId: string;
  private _variants: Record<string, number>;
  private _needed: boolean;

  private constructor(params: ReconstructCollectionCardParams) {
    this._id = params.id;
    this._userId = params.userId;
    this._cardId = params.cardId;
    this._setId = params.setId;
    this._variants = params.variants;
    this._needed = params.needed;
  }

  static create(params: CreateCollectionCardParams): CollectionCard {
    if (!params.cardId || params.cardId.trim().length === 0) {
      throw new InvalidCardIdException();
    }
    if (!params.setId || params.setId.trim().length === 0) {
      throw new InvalidSetIdException();
    }
    return new CollectionCard(params);
  }

  static reconstruct(params: ReconstructCollectionCardParams): CollectionCard {
    return new CollectionCard(params);
  }

  updateVariants(variants: Record<string, number>): void {
    this._variants = { ...this._variants, ...variants };
    // Remove zero-quantity variants
    Object.keys(this._variants).forEach((key) => {
      if (this._variants[key] <= 0) {
        delete this._variants[key];
      }
    });
  }

  toggleNeeded(): void {
    this._needed = !this._needed;
  }

  get id(): string {
    return this._id;
  }

  get userId(): string {
    return this._userId;
  }

  get cardId(): string {
    return this._cardId;
  }

  get setId(): string {
    return this._setId;
  }

  get variants(): Record<string, number> {
    return { ...this._variants };
  }

  get needed(): boolean {
    return this._needed;
  }
}
