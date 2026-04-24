import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { SignUpUseCase } from '../../application/use-cases/auth/sign-up/sign-up.use-case';
import { SignInUseCase } from '../../application/use-cases/auth/sign-in/sign-in.use-case';
import { SignUpRequest } from '../../application/use-cases/auth/sign-up/sign-up.request.dto';
import { SignUpResponse } from '../../application/use-cases/auth/sign-up/sign-up.response.dto';
import { SignInRequest } from '../../application/use-cases/auth/sign-in/sign-in.request.dto';
import { SignInResponse } from '../../application/use-cases/auth/sign-in/sign-in.response.dto';

@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly signUpUseCase: SignUpUseCase,
    private readonly signInUseCase: SignInUseCase,
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
}
