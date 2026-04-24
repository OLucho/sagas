import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/sqlite';
import { ICreateListRepository } from '../../../application/use-cases/lists/create-list/interfaces/create-list.repository.interface';
import { IListByUserRepository } from '../../../application/use-cases/lists/get-user-lists/interfaces/list-by-user.repository.interface';
import { IFindListByIdRepository } from '../../../application/use-cases/lists/get-list-by-id/interfaces/find-list-by-id.repository.interface';
import { IUpdateListRepository } from '../../../application/use-cases/lists/update-list/interfaces/update-list.repository.interface';
import { IDeleteListRepository } from '../../../application/use-cases/lists/delete-list/interfaces/delete-list.repository.interface';
import { List } from '../../../domain/entities/list.entity';
import { ListOrmEntity } from '../entities/list.orm-entity';
import { ListMapper } from '../mappers/list.mapper';

@Injectable()
export class ListRepository implements
  ICreateListRepository,
  IListByUserRepository,
  IFindListByIdRepository,
  IUpdateListRepository,
  IDeleteListRepository
{
  constructor(private readonly em: EntityManager) {}

  async create(list: List): Promise<void> {
    await this.em.transactional(async (em) => {
      const entity = ListMapper.toOrm(list);
      em.persist(entity);
      await em.flush();
    });
  }

  async existsByName(userId: string, name: string): Promise<boolean> {
    const count = await this.em.count(ListOrmEntity, { userId, name });
    return count > 0;
  }

  async findByUserId(userId: string): Promise<List[]> {
    const entities = await this.em.find(ListOrmEntity, { userId }, { orderBy: { createdAt: 'DESC' } });
    return entities.map(ListMapper.toDomain);
  }

  async findById(id: string): Promise<List | null> {
    const entity = await this.em.findOne(ListOrmEntity, { id });
    if (!entity) return null;
    return ListMapper.toDomain(entity);
  }

  async findPublicById(id: string): Promise<List | null> {
    const entity = await this.em.findOne(ListOrmEntity, { id, isPublic: true });
    if (!entity) return null;
    return ListMapper.toDomain(entity);
  }

  async save(list: List): Promise<void> {
    await this.em.transactional(async (em) => {
      const entity = ListMapper.toOrm(list);
      await em.upsert(ListOrmEntity, entity);
      await em.flush();
    });
  }

  async delete(id: string): Promise<void> {
    await this.em.transactional(async (em) => {
      const entity = await em.findOneOrFail(ListOrmEntity, { id });
      em.remove(entity);
      await em.flush();
    });
  }
}
