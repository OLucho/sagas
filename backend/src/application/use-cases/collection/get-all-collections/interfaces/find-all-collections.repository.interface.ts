import { CollectionCard } from '../../../../../domain/entities/collection-card.entity';

export interface IFindAllCollectionsRepository {
  findByUserId(userId: string): Promise<CollectionCard[]>;
}
