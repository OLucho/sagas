import { PasswordResetToken } from '../../../domain/entities/password-reset-token.entity';
import { PasswordResetTokenOrmEntity } from '../entities/password-reset-token.orm-entity';

export class PasswordResetTokenMapper {
  static toDomain(entity: PasswordResetTokenOrmEntity): PasswordResetToken {
    return PasswordResetToken.reconstruct({
      id: entity.id,
      userId: entity.userId,
      tokenHash: entity.tokenHash,
      expiresAt: entity.expiresAt,
      used: entity.used,
    });
  }

  static toOrm(domain: PasswordResetToken): PasswordResetTokenOrmEntity {
    const entity = new PasswordResetTokenOrmEntity();
    entity.id = domain.id;
    entity.userId = domain.userId;
    entity.tokenHash = domain.tokenHash;
    entity.expiresAt = domain.expiresAt;
    entity.used = domain.used;
    return entity;
  }
}
