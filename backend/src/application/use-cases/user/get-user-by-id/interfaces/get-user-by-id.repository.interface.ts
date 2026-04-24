import { User } from '../../../../../domain/entities/user.entity';

export interface IGetUserByIdRepository {
  getById(id: string): Promise<User | null>;
}
