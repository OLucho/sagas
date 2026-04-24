import { User } from '../../../../../domain/entities/user.entity';

export interface IUpdateUserProfileRepository {
  getById(id: string): Promise<User | null>;
  update(user: User): Promise<void>;
}
