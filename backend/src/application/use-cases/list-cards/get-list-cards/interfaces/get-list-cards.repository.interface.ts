import { ListCard } from '../../../../../domain/entities/list-card.entity';

export interface IGetListCardsRepository {
  findByListId(listId: string): Promise<ListCard[]>;
}
