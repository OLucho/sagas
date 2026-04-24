import { Entity, PrimaryKey, Property, Unique } from '@mikro-orm/core';

@Entity({ tableName: 'users' })
export class UserOrmEntity {
  @PrimaryKey()
  id: string;

  @Property()
  @Unique()
  email: string;

  @Property()
  passwordHash: string;

  @Property()
  username: string;

  @Property({ nullable: true })
  whatsapp?: string;

  @Property({ nullable: true })
  instagram?: string;

  @Property()
  createdAt: Date = new Date();
}
