import { List } from '../../../../../domain/entities/list.entity';

export interface IFindListByIdRepository {
  findById(id: string): Promise<List | null>;
}
