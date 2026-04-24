import { Injectable, Inject } from '@nestjs/common';
import type { IFindAllCollectionsRepository } from './interfaces/find-all-collections.repository.interface';
import { GetAllCollectionsResponse } from './get-all-collections.response.dto';

@Injectable()
export class GetAllCollectionsUseCase {
  constructor(
    @Inject('IFindAllCollectionsRepository')
    private readonly repo: IFindAllCollectionsRepository,
  ) {}

  async execute(userId: string): Promise<GetAllCollectionsResponse[]> {
    const cards = await this.repo.findByUserId(userId);
    return cards.map((card) => ({
      id: card.id,
      cardId: card.cardId,
      setId: card.setId,
      variants: card.variants,
      needed: card.needed,
    }));
  }
}
