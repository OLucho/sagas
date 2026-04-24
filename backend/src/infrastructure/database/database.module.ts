import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { UserOrmEntity } from './entities/user.orm-entity';
import { ListOrmEntity } from './entities/list.orm-entity';
import { CollectionCardOrmEntity } from './entities/collection-card.orm-entity';
import { UserRepository } from './repositories/user.repository';
import { ListRepository } from './repositories/list.repository';
import { CollectionCardRepository } from './repositories/collection-card.repository';

@Module({
  imports: [
    MikroOrmModule.forFeature([UserOrmEntity, ListOrmEntity, CollectionCardOrmEntity]),
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
  ],
})
export class DatabaseModule {}
