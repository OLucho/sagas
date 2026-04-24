import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/sqlite';
import { IFindCollectionCardRepository } from '../../../application/use-cases/collection/update-card-in-collection/interfaces/find-collection-card.repository.interface';
import { ISaveCollectionCardRepository } from '../../../application/use-cases/collection/update-card-in-collection/interfaces/save-collection-card.repository.interface';
import { IFindCollectionBySetRepository } from '../../../application/use-cases/collection/get-collection-by-set/interfaces/find-collection-by-set.repository.interface';
import { IFindAllCollectionsRepository } from '../../../application/use-cases/collection/get-all-collections/interfaces/find-all-collections.repository.interface';
import { CollectionCard } from '../../../domain/entities/collection-card.entity';
import { CollectionCardOrmEntity } from '../entities/collection-card.orm-entity';
import { CollectionCardMapper } from '../mappers/collection-card.mapper';

@Injectable()
export class CollectionCardRepository implements
  IFindCollectionCardRepository,
  ISaveCollectionCardRepository,
  IFindCollectionBySetRepository,
  IFindAllCollectionsRepository
{
  constructor(private readonly em: EntityManager) {}

  async findByUserIdAndCardId(userId: string, cardId: string): Promise<CollectionCard | null> {
    const entity = await this.em.findOne(CollectionCardOrmEntity, { userId, cardId });
    if (!entity) return null;
    return CollectionCardMapper.toDomain(entity);
  }

  async save(card: CollectionCard): Promise<void> {
    await this.em.transactional(async (em) => {
      const entity = CollectionCardMapper.toOrm(card);
      em.persist(entity);
      await em.flush();
    });
  }

  async findByUserIdAndSetId(userId: string, setId: string): Promise<CollectionCard[]> {
    const entities = await this.em.find(CollectionCardOrmEntity, { userId, setId });
    return entities.map(CollectionCardMapper.toDomain);
  }

  async findByUserId(userId: string): Promise<CollectionCard[]> {
    const entities = await this.em.find(CollectionCardOrmEntity, { userId });
    return entities.map(CollectionCardMapper.toDomain);
  }
}
