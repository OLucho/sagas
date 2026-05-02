import { defineConfig } from '@mikro-orm/postgresql';
import { UserOrmEntity } from './src/infrastructure/database/entities/user.orm-entity';
import { ListOrmEntity } from './src/infrastructure/database/entities/list.orm-entity';
import { CollectionCardOrmEntity } from './src/infrastructure/database/entities/collection-card.orm-entity';
import { ListCardOrmEntity } from './src/infrastructure/database/entities/list-card.orm-entity';
import { PasswordResetTokenOrmEntity } from './src/infrastructure/database/entities/password-reset-token.orm-entity';

export default defineConfig({
  clientUrl: `postgresql://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
  entities: [UserOrmEntity, ListOrmEntity, CollectionCardOrmEntity, ListCardOrmEntity, PasswordResetTokenOrmEntity],
  migrations: {
    path: './src/migrations',
    pathTs: './src/migrations',
  },
});