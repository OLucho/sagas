import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { SignUpUseCase } from '../../application/use-cases/auth/sign-up/sign-up.use-case';
import { SignInUseCase } from '../../application/use-cases/auth/sign-in/sign-in.use-case';
import { RequestPasswordResetUseCase } from '../../application/use-cases/auth/request-password-reset/request-password-reset.use-case';
import { ResetPasswordUseCase } from '../../application/use-cases/auth/reset-password/reset-password.use-case';
import { SignUpRequest } from '../../application/use-cases/auth/sign-up/sign-up.request.dto';
import { SignUpResponse } from '../../application/use-cases/auth/sign-up/sign-up.response.dto';
import { SignInRequest } from '../../application/use-cases/auth/sign-in/sign-in.request.dto';
import { SignInResponse } from '../../application/use-cases/auth/sign-in/sign-in.response.dto';
import { RequestPasswordResetRequest } from '../../application/use-cases/auth/request-password-reset/request-password-reset.request.dto';
import { RequestPasswordResetResponse } from '../../application/use-cases/auth/request-password-reset/request-password-reset.response.dto';
import { ResetPasswordRequest } from '../../application/use-cases/auth/reset-password/reset-password.request.dto';
import { ResetPasswordResponse } from '../../application/use-cases/auth/reset-password/reset-password.response.dto';

@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly signUpUseCase: SignUpUseCase,
    private readonly signInUseCase: SignInUseCase,
    private readonly requestPasswordResetUseCase: RequestPasswordResetUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
  ) {}

  @Post('signup')
  @HttpCode(201)
  async signUp(@Body() dto: SignUpRequest): Promise<SignUpResponse> {
    return this.signUpUseCase.execute(dto);
  }

  @Post('signin')
  @HttpCode(200)
  async signIn(@Body() dto: SignInRequest): Promise<SignInResponse> {
    return this.signInUseCase.execute(dto);
  }

  @Post('forgot-password')
  @HttpCode(200)
  @Throttle({ default: { ttl: 60000, limit: 3 } })
  async forgotPassword(@Body() dto: RequestPasswordResetRequest): Promise<RequestPasswordResetResponse> {
    return this.requestPasswordResetUseCase.execute(dto);
  }

  @Post('reset-password')
  @HttpCode(200)
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  async resetPassword(@Body() dto: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    return this.resetPasswordUseCase.execute(dto);
  }
}
