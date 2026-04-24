import { List } from '../../../../../domain/entities/list.entity';

export interface ICreateListRepository {
  create(list: List): Promise<void>;
  existsByName(userId: string, name: string): Promise<boolean>;
}