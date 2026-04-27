import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/sqlite';
import { ListCard } from '../../../domain/entities/list-card.entity';
import { ListCardOrmEntity } from '../entities/list-card.orm-entity';
import { ListCardMapper } from '../mappers/list-card.mapper';

@Injectable()
export class ListCardRepository {
  constructor(private readonly em: EntityManager) {}

  async findByListId(listId: string): Promise<ListCard[]> {
    const entities = await this.em.find(ListCardOrmEntity, { listId }, { orderBy: { addedAt: 'DESC' } });
    return entities.map(ListCardMapper.toDomain);
  }

  async findByListIdAndCardId(listId: string, cardId: string): Promise<ListCard | null> {
    const entity = await this.em.findOne(ListCardOrmEntity, { listId, cardId });
    if (!entity) return null;
    return ListCardMapper.toDomain(entity);
  }

  async save(card: ListCard): Promise<void> {
    await this.em.transactional(async (em) => {
      const entity = ListCardMapper.toOrm(card);
      await em.upsert(ListCardOrmEntity, entity);
      await em.flush();
    });
  }

  async delete(listId: string, cardId: string): Promise<void> {
    await this.em.transactional(async (em) => {
      const entity = await em.findOne(ListCardOrmEntity, { listId, cardId });
      if (entity) {
        em.remove(entity);
        await em.flush();
      }
    });
  }
}
