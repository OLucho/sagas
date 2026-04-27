import { List } from '../../../domain/entities/list.entity';
import { ListOrmEntity } from '../entities/list.orm-entity';

export class ListMapper {
  static toDomain(entity: ListOrmEntity): List {
    return List.reconstruct({
      id: entity.id,
      userId: entity.userId,
      name: entity.name,
      isPublic: entity.isPublic,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  static toOrm(domain: List): ListOrmEntity {
    const entity = new ListOrmEntity();
    entity.id = domain.id;
    entity.userId = domain.userId;
    entity.name = domain.name;
    entity.isPublic = domain.isPublic;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }
}
