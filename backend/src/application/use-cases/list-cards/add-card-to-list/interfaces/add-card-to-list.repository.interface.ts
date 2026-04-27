import { ListCard } from '../../../../../domain/entities/list-card.entity';

export interface IAddCardToListRepository {
  save(card: ListCard): Promise<void>;
}
