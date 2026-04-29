import { PasswordResetToken } from '../../../../../domain/entities/password-reset-token.entity';

export interface IFindPasswordResetTokenByUserIdRepository {
  findByUserId(userId: string): Promise<PasswordResetToken | null>;
}
