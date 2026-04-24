import { User } from '../../../../../domain/entities/user.entity';

export interface IGetUserByEmailRepository {
  getByEmail(email: string): Promise<User | null>;
}