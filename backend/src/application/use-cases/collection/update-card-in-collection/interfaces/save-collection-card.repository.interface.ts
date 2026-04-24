import { CollectionCard } from '../../../../../domain/entities/collection-card.entity';

export interface ISaveCollectionCardRepository {
  save(card: CollectionCard): Promise<void>;
}
