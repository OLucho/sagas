import { Injectable, Inject } from '@nestjs/common';
import type { IGetUserByEmailRepository } from '../sign-in/interfaces/get-user-by-email.repository.interface';
import type { IPasswordHasher } from '../../../../domain/services/password.service';
import type { ITokenHasher } from '../../../../domain/services/token-hasher.service';
import { ResetPasswordRequest } from './reset-password.request.dto';
import { ResetPasswordResponse } from './reset-password.response.dto';
import { InvalidResetTokenException } from '../../../../domain/exceptions/invalid-reset-token.exception';
import type { IFindPasswordResetTokenByUserIdRepository } from './interfaces/find-password-reset-token-by-user-id.repository.interface';
import type { IResetPasswordAtomicRepository } from './interfaces/update-user-password.repository.interface';

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    @Inject('IGetUserByEmailRepository')
    private readonly userRepository: IGetUserByEmailRepository,
    @Inject('IPasswordHasher')
    private readonly passwordHasher: IPasswordHasher,
    @Inject('ITokenHasher')
    private readonly tokenHasher: ITokenHasher,
    @Inject('IFindPasswordResetTokenByUserIdRepository')
    private readonly tokenRepository: IFindPasswordResetTokenByUserIdRepository,
    @Inject('IResetPasswordAtomicRepository')
    private readonly resetPasswordAtomicRepository: IResetPasswordAtomicRepository,
  ) {}

  async execute(request: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    const user = await this.userRepository.getByEmail(request.email);

    if (!user) {
      throw new InvalidResetTokenException();
    }

    const token = await this.tokenRepository.findByUserId(user.id);

    if (!token || token.used || token.isExpired()) {
      throw new InvalidResetTokenException();
    }

    const isCodeValid = await this.tokenHasher.compare(request.code, token.tokenHash);

    if (!isCodeValid) {
      throw new InvalidResetTokenException();
    }

    const newPasswordHash = await this.passwordHasher.hash(request.password);

    await this.resetPasswordAtomicRepository.updatePasswordAndInvalidateToken(user.id, newPasswordHash, token.id);

    return new ResetPasswordResponse(true);
  }
}
