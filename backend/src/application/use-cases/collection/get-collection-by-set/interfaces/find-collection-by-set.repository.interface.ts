import { CollectionCard } from '../../../../../domain/entities/collection-card.entity';

export interface IFindCollectionBySetRepository {
  findByUserIdAndSetId(userId: string, setId: string): Promise<CollectionCard[]>;
}
