import { Injectable, Inject } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { IAddCardToListRepository } from './interfaces/add-card-to-list.repository.interface';
import { ListCard } from '../../../../domain/entities/list-card.entity';

@Injectable()
export class AddCardToListUseCase {
  constructor(
    @Inject('IAddCardToListRepository')
    private readonly repo: IAddCardToListRepository,
  ) {}

  async execute(
    listId: string,
    cardId: string,
    variants: Record<string, number>,
  ): Promise<void> {
    const card = ListCard.create({
      id: randomUUID(),
      listId,
      cardId,
      variants,
    });
    await this.repo.save(card);
  }
}
