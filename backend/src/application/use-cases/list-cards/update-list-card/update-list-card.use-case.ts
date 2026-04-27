import { Injectable, Inject } from '@nestjs/common';
import type { IUpdateListCardRepository } from './interfaces/update-list-card.repository.interface';
import type { IFindListByIdRepository } from '../../lists/get-list-by-id/interfaces/find-list-by-id.repository.interface';
import { ListNotFoundException } from '../../../../domain/exceptions/list-not-found.exception';
import { ListAccessDeniedException } from '../../../../domain/exceptions/list-access-denied.exception';
import { randomUUID } from 'crypto';
import { ListCard } from '../../../../domain/entities/list-card.entity';

@Injectable()
export class UpdateListCardUseCase {
  constructor(
    @Inject('IUpdateListCardRepository')
    private readonly listCardRepo: IUpdateListCardRepository,
    @Inject('IFindListByIdRepository')
    private readonly listRepo: IFindListByIdRepository,
  ) {}

  async execute(
    listId: string,
    cardId: string,
    variants: Record<string, number>,
    userId: string,
  ): Promise<void> {
    const list = await this.listRepo.findById(listId);
    if (!list) {
      throw new ListNotFoundException();
    }
    if (list.userId !== userId) {
      throw new ListAccessDeniedException();
    }

    const existing = await this.listCardRepo.findByListIdAndCardId(listId, cardId);
    if (existing) {
      existing.updateVariants(variants);
      await this.listCardRepo.save(existing);
    } else {
      const card = ListCard.create({
        id: randomUUID(),
        listId,
        cardId,
        variants,
      });
      await this.listCardRepo.save(card);
    }
  }
}
