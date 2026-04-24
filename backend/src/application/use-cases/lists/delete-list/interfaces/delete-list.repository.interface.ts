import { List } from '../../../../../domain/entities/list.entity';

export interface IDeleteListRepository {
  findById(id: string): Promise<List | null>;
  delete(id: string): Promise<void>;
}
