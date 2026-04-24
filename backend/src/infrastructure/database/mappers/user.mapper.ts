import { User } from '../../../domain/entities/user.entity';
import { UserOrmEntity } from '../entities/user.orm-entity';

export class UserMapper {
  static toDomain(entity: UserOrmEntity): User {
    return User.reconstruct({
      id: entity.id,
      email: entity.email,
      passwordHash: entity.passwordHash,
      username: entity.username,
      createdAt: entity.createdAt,
      whatsapp: entity.whatsapp,
      instagram: entity.instagram,
    });
  }

  static toOrm(domain: User): UserOrmEntity {
    const entity = new UserOrmEntity();
    entity.id = domain.id;
    entity.email = domain.email;
    entity.passwordHash = domain.passwordHash;
    entity.username = domain.username;
    entity.whatsapp = domain.whatsapp;
    entity.instagram = domain.instagram;
    entity.createdAt = domain.createdAt;
    return entity;
  }
}
