import { Injectable, Inject } from '@nestjs/common';
import type { IGetListCardsRepository } from './interfaces/get-list-cards.repository.interface';

export interface GetListCardsResponse {
  id: string;
  listId: string;
  cardId: string;
  variants: Record<string, number>;
  addedAt: string;
}

@Injectable()
export class GetListCardsUseCase {
  constructor(
    @Inject('IGetListCardsRepository')
    private readonly repo: IGetListCardsRepository,
  ) {}

  async execute(listId: string): Promise<GetListCardsResponse[]> {
    const cards = await this.repo.findByListId(listId);
    return cards.map((c) => ({
      id: c.id,
      listId: c.listId,
      cardId: c.cardId,
      variants: c.variants,
      addedAt: c.addedAt.toISOString(),
    }));
  }
}
