import { Entity, PrimaryKey, Property, Index, Unique } from '@mikro-orm/core';

@Entity({ tableName: 'collection_cards' })
@Unique({ properties: ['userId', 'cardId'] })
export class CollectionCardOrmEntity {
  @PrimaryKey()
  id: string;

  @Property()
  @Index()
  userId: string;

  @Property()
  @Index()
  cardId: string;

  @Property()
  @Index()
  setId: string;

  @Property({ type: 'json' })
  variants: Record<string, number> = {};

  @Property()
  needed: boolean = false;
}
