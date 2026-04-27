import { ListCard } from '../../../../../domain/entities/list-card.entity';

export interface IUpdateListCardRepository {
  findByListIdAndCardId(listId: string, cardId: string): Promise<ListCard | null>;
  save(card: ListCard): Promise<void>;
}
