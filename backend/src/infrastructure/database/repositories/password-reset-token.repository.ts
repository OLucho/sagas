import { EntityManager } from '@mikro-orm/sqlite';
import { Injectable } from '@nestjs/common';
import { PasswordResetToken } from '../../../domain/entities/password-reset-token.entity';
import { PasswordResetTokenOrmEntity } from '../entities/password-reset-token.orm-entity';
import { PasswordResetTokenMapper } from '../mappers/password-reset-token.mapper';
import { ISavePasswordResetTokenRepository } from '../../../application/use-cases/auth/request-password-reset/interfaces/save-password-reset-token.repository.interface';
import { IFindPasswordResetTokenByUserIdRepository } from '../../../application/use-cases/auth/reset-password/interfaces/find-password-reset-token-by-user-id.repository.interface';

@Injectable()
export class PasswordResetTokenRepository implements
  ISavePasswordResetTokenRepository,
  IFindPasswordResetTokenByUserIdRepository
{
  constructor(private readonly em: EntityManager) {}

  async save(token: PasswordResetToken): Promise<void> {
    await this.em.transactional(async (em) => {
      const entity = PasswordResetTokenMapper.toOrm(token);
      em.persist(entity);
      await em.flush();
    });
  }

  async findByUserId(userId: string): Promise<PasswordResetToken | null> {
    const entity = await this.em.findOne(
      PasswordResetTokenOrmEntity,
      { userId },
      { orderBy: { createdAt: 'DESC' } },
    );
    if (!entity) return null;
    return PasswordResetTokenMapper.toDomain(entity);
  }
}
