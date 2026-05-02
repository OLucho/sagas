import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { DatabaseModule } from './infrastructure/database/database.module';
import { SecurityModule } from './infrastructure/security/security.module';
import { EmailModule } from './infrastructure/services/email.module';
import { ListController } from './presentation/controllers/list.controller';
import { CollectionController } from './presentation/controllers/collection.controller';
import { AuthController } from './presentation/controllers/auth.controller';
import { UserController } from './presentation/controllers/user.controller';
import { HealthController } from './presentation/controllers/health.controller';
import { CreateListUseCase } from './application/use-cases/lists/create-list/create-list.use-case';
import { GetUserListsUseCase } from './application/use-cases/lists/get-user-lists/get-user-lists.use-case';
import { GetListByIdUseCase } from './application/use-cases/lists/get-list-by-id/get-list-by-id.use-case';
import { UpdateListUseCase } from './application/use-cases/lists/update-list/update-list.use-case';
import { DeleteListUseCase } from './application/use-cases/lists/delete-list/delete-list.use-case';
import { GetAllCollectionsUseCase } from './application/use-cases/collection/get-all-collections/get-all-collections.use-case';
import { UpdateCardInCollectionUseCase } from './application/use-cases/collection/update-card-in-collection/update-card-in-collection.use-case';
import { UpdateListCardUseCase } from './application/use-cases/list-cards/update-list-card/update-list-card.use-case';
import { AddCardToListUseCase } from './application/use-cases/list-cards/add-card-to-list/add-card-to-list.use-case';
import { GetListCardsUseCase } from './application/use-cases/list-cards/get-list-cards/get-list-cards.use-case';
import { RemoveCardFromListUseCase } from './application/use-cases/list-cards/remove-card-from-list/remove-card-from-list.use-case';
import { MarkCardAsNeedUseCase } from './application/use-cases/collection/mark-card-as-need/mark-card-as-need.use-case';
import { SignUpUseCase } from './application/use-cases/auth/sign-up/sign-up.use-case';
import { SignInUseCase } from './application/use-cases/auth/sign-in/sign-in.use-case';
import { RequestPasswordResetUseCase } from './application/use-cases/auth/request-password-reset/request-password-reset.use-case';
import { ResetPasswordUseCase } from './application/use-cases/auth/reset-password/reset-password.use-case';
import { GetUserByIdUseCase } from './application/use-cases/user/get-user-by-id/get-user-by-id.use-case';
import { UpdateUserProfileUseCase } from './application/use-cases/user/update-user-profile/update-user-profile.use-case';

@Module({
  imports: [
    MikroOrmModule.forRootAsync({
      useFactory: () => ({
        driver: PostgreSqlDriver,
        clientUrl: `postgresql://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
        autoLoadEntities: true,
        synchronize: process.env.NODE_ENV !== 'production',
        debug: process.env.NODE_ENV !== 'production',
        ...(process.env.DB_SSL === 'true' && {
          driverOptions: {
            connection: {
              ssl: { rejectUnauthorized: false },
            },
          },
        }),
        migrations: {
          path: './src/migrations',
          pathTs: './src/migrations',
        },
      }),
    }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 10 }]),
    DatabaseModule,
    SecurityModule,
    EmailModule,
  ],
  controllers: [ListController, CollectionController, AuthController, UserController, HealthController],
  providers: [
    CreateListUseCase,
    GetUserListsUseCase,
    GetListByIdUseCase,
    UpdateListUseCase,
    DeleteListUseCase,
    GetListCardsUseCase,
    AddCardToListUseCase,
    UpdateListCardUseCase,
    RemoveCardFromListUseCase,
    GetAllCollectionsUseCase,
    UpdateCardInCollectionUseCase,
    MarkCardAsNeedUseCase,
    SignUpUseCase,
    SignInUseCase,
    RequestPasswordResetUseCase,
    ResetPasswordUseCase,
    GetUserByIdUseCase,
    UpdateUserProfileUseCase,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
