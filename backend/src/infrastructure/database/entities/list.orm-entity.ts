import { Entity, PrimaryKey, Property, Index } from '@mikro-orm/core';

@Entity({ tableName: 'lists' })
export class ListOrmEntity {
  @PrimaryKey()
  id: string;

  @Property()
  @Index()
  userId: string;

  @Property()
  name: string;

  @Property()
  isPublic: boolean;

  @Property()
  createdAt: Date = new Date();
}
