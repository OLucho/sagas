import { Injectable, Inject } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { IFindCollectionCardRepository } from './interfaces/find-collection-card.repository.interface';
import type { ISaveCollectionCardRepository } from './interfaces/save-collection-card.repository.interface';
import { CollectionCard } from '../../../../domain/entities/collection-card.entity';

@Injectable()
export class UpdateCardInCollectionUseCase {
  constructor(
    @Inject('IFindCollectionCardRepository')
    private readonly findRepo: IFindCollectionCardRepository,
    @Inject('ISaveCollectionCardRepository')
    private readonly saveRepo: ISaveCollectionCardRepository,
  ) {}

  async execute(
    userId: string,
    setId: string,
    cardId: string,
    variants: Record<string, number>,
  ): Promise<void> {
    let card = await this.findRepo.findByUserIdAndCardId(userId, cardId);

    if (!card) {
      card = CollectionCard.create({
        id: randomUUID(),
        userId,
        cardId,
        setId,
        variants: {},
        needed: false,
      });
    }

    card.updateVariants(variants);
    await this.saveRepo.save(card);
  }
}
