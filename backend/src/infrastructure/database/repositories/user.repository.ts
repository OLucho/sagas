import { EntityManager } from '@mikro-orm/sqlite';
import { Injectable } from '@nestjs/common';
import { User } from '../../../domain/entities/user.entity';
import { UserOrmEntity } from '../entities/user.orm-entity';
import { UserMapper } from '../mappers/user.mapper';
import { ICreateUserRepository } from '../../../application/use-cases/auth/sign-up/interfaces/create-user.repository.interface';
import { IGetUserByEmailRepository } from '../../../application/use-cases/auth/sign-in/interfaces/get-user-by-email.repository.interface';
import { IGetUserByIdRepository } from '../../../application/use-cases/user/get-user-by-id/interfaces/get-user-by-id.repository.interface';
import { IUpdateUserProfileRepository } from '../../../application/use-cases/user/update-user-profile/interfaces/update-user-profile.repository.interface';

@Injectable()
export class UserRepository implements
  ICreateUserRepository,
  IGetUserByEmailRepository,
  IGetUserByIdRepository,
  IUpdateUserProfileRepository
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
}
