import { CollectionCard } from '../../../domain/entities/collection-card.entity';
import { CollectionCardOrmEntity } from '../entities/collection-card.orm-entity';

export class CollectionCardMapper {
  static toDomain(entity: CollectionCardOrmEntity): CollectionCard {
    return CollectionCard.reconstruct({
      id: entity.id,
      userId: entity.userId,
      cardId: entity.cardId,
      setId: entity.setId,
      variants: entity.variants || {},
      needed: entity.needed,
    });
  }

  static toOrm(domain: CollectionCard): CollectionCardOrmEntity {
    const entity = new CollectionCardOrmEntity();
    entity.id = domain.id;
    entity.userId = domain.userId;
    entity.cardId = domain.cardId;
    entity.setId = domain.setId;
    entity.variants = domain.variants;
    entity.needed = domain.needed;
    return entity;
  }
}
