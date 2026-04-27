export interface CreateListCardParams {
  id: string;
  listId: string;
  cardId: string;
  variants: Record<string, number>;
}

export class ListCard {
  private readonly _id: string;
  private readonly _listId: string;
  private readonly _cardId: string;
  private _variants: Record<string, number>;
  private readonly _addedAt: Date;

  private constructor(params: {
    id: string;
    listId: string;
    cardId: string;
    variants: Record<string, number>;
    addedAt: Date;
  }) {
    this._id = params.id;
    this._listId = params.listId;
    this._cardId = params.cardId;
    this._variants = params.variants;
    this._addedAt = params.addedAt;
  }

  static create(params: CreateListCardParams): ListCard {
    return new ListCard({ ...params, addedAt: new Date() });
  }

  static reconstruct(params: {
    id: string;
    listId: string;
    cardId: string;
    variants: Record<string, number>;
    addedAt: Date;
  }): ListCard {
    return new ListCard(params);
  }

  updateVariants(variants: Record<string, number>): void {
    this._variants = { ...variants };
    Object.keys(this._variants).forEach((key) => {
      if (this._variants[key] <= 0) {
        delete this._variants[key];
      }
    });
  }

  get id(): string {
    return this._id;
  }

  get listId(): string {
    return this._listId;
  }

  get cardId(): string {
    return this._cardId;
  }

  get variants(): Record<string, number> {
    return { ...this._variants };
  }

  get addedAt(): Date {
    return this._addedAt;
  }
}
