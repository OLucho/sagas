import { Injectable, Inject } from '@nestjs/common';
import type { IFindCollectionBySetRepository } from './interfaces/find-collection-by-set.repository.interface';
import { GetCollectionBySetResponse } from './get-collection-by-set.response.dto';

@Injectable()
export class GetCollectionBySetUseCase {
  constructor(
    @Inject('IFindCollectionBySetRepository')
    private readonly repo: IFindCollectionBySetRepository,
  ) {}

  async execute(userId: string, setId: string): Promise<GetCollectionBySetResponse[]> {
    const cards = await this.repo.findByUserIdAndSetId(userId, setId);
    return cards.map((card) => ({
      id: card.id,
      cardId: card.cardId,
      setId: card.setId,
      variants: card.variants,
      needed: card.needed,
    }));
  }
}
