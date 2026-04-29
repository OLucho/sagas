import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'password_reset_tokens' })
export class PasswordResetTokenOrmEntity {
  @PrimaryKey()
  id: string;

  @Property()
  userId: string;

  @Property()
  tokenHash: string;

  @Property()
  expiresAt: Date;

  @Property({ default: false })
  used: boolean = false;

  @Property()
  createdAt: Date = new Date();
}
