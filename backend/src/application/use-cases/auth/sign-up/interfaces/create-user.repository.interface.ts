import { User } from '../../../../../domain/entities/user.entity';

export interface ICreateUserRepository {
  create(user: User): Promise<void>;
  existsByEmail(email: string): Promise<boolean>;
}