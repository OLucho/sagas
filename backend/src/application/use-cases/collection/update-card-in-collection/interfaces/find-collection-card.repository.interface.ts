import { CollectionCard } from '../../../../../domain/entities/collection-card.entity';

export interface IFindCollectionCardRepository {
  findByUserIdAndCardId(userId: string, cardId: string): Promise<CollectionCard | null>;
}
