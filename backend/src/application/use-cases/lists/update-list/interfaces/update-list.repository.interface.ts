import { List } from '../../../../../domain/entities/list.entity';

export interface IUpdateListRepository {
  findById(id: string): Promise<List | null>;
  save(list: List): Promise<void>;
}
