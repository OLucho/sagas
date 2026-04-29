import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { UserOrmEntity } from './entities/user.orm-entity';
import { ListOrmEntity } from './entities/list.orm-entity';
import { CollectionCardOrmEntity } from './entities/collection-card.orm-entity';
import { ListCardOrmEntity } from './entities/list-card.orm-entity';
import { PasswordResetTokenOrmEntity } from './entities/password-reset-token.orm-entity';
import { UserRepository } from './repositories/user.repository';
import { ListRepository } from './repositories/list.repository';
import { CollectionCardRepository } from './repositories/collection-card.repository';
import { ListCardRepository } from './repositories/list-card.repository';
import { PasswordResetTokenRepository } from './repositories/password-reset-token.repository';

@Module({
  imports: [
    MikroOrmModule.forFeature([UserOrmEntity, ListOrmEntity, CollectionCardOrmEntity, ListCardOrmEntity, PasswordResetTokenOrmEntity]),
  ],
  providers: [
    {
      provide: 'ICreateUserRepository',
      useClass: UserRepository,
    },
    {
      provide: 'IGetUserByEmailRepository',
      useClass: UserRepository,
    },
    {
      provide: 'IGetUserByIdRepository',
      useClass: UserRepository,
    },
    {
      provide: 'IUpdateUserProfileRepository',
      useClass: UserRepository,
    },
    {
      provide: 'ICreateListRepository',
      useClass: ListRepository,
    },
    {
      provide: 'IListByUserRepository',
      useClass: ListRepository,
    },
    {
      provide: 'IFindListByIdRepository',
      useClass: ListRepository,
    },
    {
      provide: 'IUpdateListRepository',
      useClass: ListRepository,
    },
    {
      provide: 'IDeleteListRepository',
      useClass: ListRepository,
    },
    {
      provide: 'IFindCollectionCardRepository',
      useClass: CollectionCardRepository,
    },
    {
      provide: 'ISaveCollectionCardRepository',
      useClass: CollectionCardRepository,
    },
    {
      provide: 'IFindCollectionBySetRepository',
      useClass: CollectionCardRepository,
    },
    {
      provide: 'IFindAllCollectionsRepository',
      useClass: CollectionCardRepository,
    },
    {
      provide: 'IGetListCardsRepository',
      useClass: ListCardRepository,
    },
    {
      provide: 'IAddCardToListRepository',
      useClass: ListCardRepository,
    },
    {
      provide: 'IUpdateListCardRepository',
      useClass: ListCardRepository,
    },
    {
      provide: 'IRemoveCardFromListRepository',
      useClass: ListCardRepository,
    },
    {
      provide: 'ISavePasswordResetTokenRepository',
      useClass: PasswordResetTokenRepository,
    },
    {
      provide: 'IFindPasswordResetTokenByUserIdRepository',
      useClass: PasswordResetTokenRepository,
    },
    {
      provide: 'IResetPasswordAtomicRepository',
      useClass: UserRepository,
    },
  ],
  exports: [
    'ICreateUserRepository',
    'IGetUserByEmailRepository',
    'IGetUserByIdRepository',
    'IUpdateUserProfileRepository',
    'ICreateListRepository',
    'IListByUserRepository',
    'IFindListByIdRepository',
    'IUpdateListRepository',
    'IDeleteListRepository',
    'IFindCollectionCardRepository',
    'ISaveCollectionCardRepository',
    'IFindCollectionBySetRepository',
    'IFindAllCollectionsRepository',
    'IGetListCardsRepository',
    'IAddCardToListRepository',
    'IUpdateListCardRepository',
    'IRemoveCardFromListRepository',
    'ISavePasswordResetTokenRepository',
    'IFindPasswordResetTokenByUserIdRepository',
    'IResetPasswordAtomicRepository',
  ],
})
export class DatabaseModule {}
