import { List } from '../../../../../domain/entities/list.entity';

export interface IListByUserRepository {
  findByUserId(userId: string): Promise<List[]>;
}
