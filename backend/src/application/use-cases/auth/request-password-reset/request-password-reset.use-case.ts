import { Injectable, Inject } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { IGetUserByEmailRepository } from '../sign-in/interfaces/get-user-by-email.repository.interface';
import type { ITokenHasher } from '../../../../domain/services/token-hasher.service';
import type { IEmailService } from '../../../../domain/services/email.service';
import { RequestPasswordResetRequest } from './request-password-reset.request.dto';
import { RequestPasswordResetResponse } from './request-password-reset.response.dto';
import { PasswordResetToken } from '../../../../domain/entities/password-reset-token.entity';
import type { ISavePasswordResetTokenRepository } from './interfaces/save-password-reset-token.repository.interface';

@Injectable()
export class RequestPasswordResetUseCase {
  constructor(
    @Inject('IGetUserByEmailRepository')
    private readonly userRepository: IGetUserByEmailRepository,
    @Inject('ITokenHasher')
    private readonly tokenHasher: ITokenHasher,
    @Inject('IEmailService')
    private readonly emailService: IEmailService,
    @Inject('ISavePasswordResetTokenRepository')
    private readonly tokenRepository: ISavePasswordResetTokenRepository,
  ) {}

  async execute(request: RequestPasswordResetRequest): Promise<RequestPasswordResetResponse> {
    const user = await this.userRepository.getByEmail(request.email);

    if (!user) {
      return new RequestPasswordResetResponse(true);
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const tokenHash = await this.tokenHasher.hash(code);

    await this.emailService.sendPasswordResetCode(user.email, code);

    const token = PasswordResetToken.create({
      id: randomUUID(),
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });

    await this.tokenRepository.save(token);

    return new RequestPasswordResetResponse(true);
  }
}
