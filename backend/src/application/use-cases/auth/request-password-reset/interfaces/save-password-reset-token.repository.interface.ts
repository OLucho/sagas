import { PasswordResetToken } from '../../../../../domain/entities/password-reset-token.entity';

export interface ISavePasswordResetTokenRepository {
  save(token: PasswordResetToken): Promise<void>;
}
