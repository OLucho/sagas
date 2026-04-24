import { Injectable, Inject } from '@nestjs/common';
import type { IGetUserByEmailRepository } from './interfaces/get-user-by-email.repository.interface';
import type { IPasswordHasher } from '../../../../domain/services/password.service';
import type { IAuthTokenService } from '../../../../domain/services/auth-token.service';
import { SignInRequest } from './sign-in.request.dto';
import { SignInResponse } from './sign-in.response.dto';
import { InvalidCredentialsException } from '../../../../domain/exceptions/invalid-credentials.exception';

@Injectable()
export class SignInUseCase {
  constructor(
    @Inject('IGetUserByEmailRepository')
    private readonly userRepository: IGetUserByEmailRepository,
    @Inject('IPasswordHasher')
    private readonly passwordHasher: IPasswordHasher,
    @Inject('IAuthTokenService')
    private readonly authTokenService: IAuthTokenService,
  ) {}

  async execute(request: SignInRequest): Promise<SignInResponse> {
    const user = await this.userRepository.getByEmail(request.email);

    if (!user) {
      throw new InvalidCredentialsException();
    }

    const isPasswordValid = await this.passwordHasher.compare(request.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new InvalidCredentialsException();
    }

    const token = this.authTokenService.sign({ sub: user.id, username: user.username });

    return new SignInResponse(token, user.id, user.username);
  }
}
