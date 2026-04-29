import { EntityManager } from '@mikro-orm/sqlite';
import { Injectable } from '@nestjs/common';
import { User } from '../../../domain/entities/user.entity';
import { UserOrmEntity } from '../entities/user.orm-entity';
import { UserMapper } from '../mappers/user.mapper';
import { ICreateUserRepository } from '../../../application/use-cases/auth/sign-up/interfaces/create-user.repository.interface';
import { IGetUserByEmailRepository } from '../../../application/use-cases/auth/sign-in/interfaces/get-user-by-email.repository.interface';
import { IGetUserByIdRepository } from '../../../application/use-cases/user/get-user-by-id/interfaces/get-user-by-id.repository.interface';
import { IUpdateUserProfileRepository } from '../../../application/use-cases/user/update-user-profile/interfaces/update-user-profile.repository.interface';
import { IResetPasswordAtomicRepository } from '../../../application/use-cases/auth/reset-password/interfaces/update-user-password.repository.interface';
import { PasswordResetTokenOrmEntity } from '../entities/password-reset-token.orm-entity';
import { UserNotFoundException } from '../../../domain/exceptions/user-not-found.exception';
import { InvalidResetTokenException } from '../../../domain/exceptions/invalid-reset-token.exception';

@Injectable()
export class UserRepository implements
  ICreateUserRepository,
  IGetUserByEmailRepository,
  IGetUserByIdRepository,
  IUpdateUserProfileRepository,
  IResetPasswordAtomicRepository
{
  constructor(private readonly em: EntityManager) {}

  async create(user: User): Promise<void> {
    await this.em.transactional(async (em) => {
      const entity = UserMapper.toOrm(user);
      em.persist(entity);
      await em.flush();
    });
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.em.count(UserOrmEntity, { email: email.toLowerCase() });
    return count > 0;
  }

  async getByEmail(email: string): Promise<User | null> {
    const entity = await this.em.findOne(UserOrmEntity, { email: email.toLowerCase() });
    if (!entity) return null;
    return UserMapper.toDomain(entity);
  }

  async getById(id: string): Promise<User | null> {
    const entity = await this.em.findOne(UserOrmEntity, { id });
    if (!entity) return null;
    return UserMapper.toDomain(entity);
  }

  async update(user: User): Promise<void> {
    await this.em.transactional(async (em) => {
      const entity = UserMapper.toOrm(user);
      await em.upsert(UserOrmEntity, entity);
      await em.flush();
    });
  }

  async updatePasswordAndInvalidateToken(userId: string, passwordHash: string, tokenId: string): Promise<void> {
    await this.em.transactional(async (em) => {
      const user = await em.findOne(UserOrmEntity, { id: userId });
      if (!user) {
        throw new UserNotFoundException();
      }
      user.passwordHash = passwordHash;

      const token = await em.findOne(PasswordResetTokenOrmEntity, { id: tokenId });
      if (!token) {
        throw new InvalidResetTokenException();
      }
      token.used = true;

      await em.flush();
    });
  }
}
