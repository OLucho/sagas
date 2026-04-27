import { ListCard } from '../../../domain/entities/list-card.entity';
import { ListCardOrmEntity } from '../entities/list-card.orm-entity';

export class ListCardMapper {
  static toDomain(entity: ListCardOrmEntity): ListCard {
    return ListCard.reconstruct({
      id: entity.id,
      listId: entity.listId,
      cardId: entity.cardId,
      variants: entity.variants,
      addedAt: entity.addedAt,
    });
  }

  static toOrm(domain: ListCard): ListCardOrmEntity {
    const entity = new ListCardOrmEntity();
    entity.id = domain.id;
    entity.listId = domain.listId;
    entity.cardId = domain.cardId;
    entity.variants = domain.variants;
    entity.addedAt = domain.addedAt;
    return entity;
  }
}
