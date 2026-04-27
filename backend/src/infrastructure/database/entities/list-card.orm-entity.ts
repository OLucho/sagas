import { Entity, PrimaryKey, Property, Index } from '@mikro-orm/core';

@Entity({ tableName: 'list_cards' })
export class ListCardOrmEntity {
  @PrimaryKey()
  id: string;

  @Property()
  @Index()
  listId: string;

  @Property()
  cardId: string;

  @Property({ type: 'json' })
  variants: Record<string, number> = {};

  @Property()
  addedAt: Date = new Date();
}
