import { Controller, Get, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { GetUserByIdUseCase } from '../../application/use-cases/user/get-user-by-id/get-user-by-id.use-case';
import { UpdateUserProfileUseCase } from '../../application/use-cases/user/update-user-profile/update-user-profile.use-case';
import { UpdateUserProfileRequest } from '../../application/use-cases/user/update-user-profile/update-user-profile.request.dto';
import { GetUserByIdResponse } from '../../application/use-cases/user/get-user-by-id/get-user-by-id.response.dto';
import { UpdateUserProfileResponse } from '../../application/use-cases/user/update-user-profile/update-user-profile.response.dto';

@Controller('api/users')
export class UserController {
  constructor(
    private readonly getUserByIdUseCase: GetUserByIdUseCase,
    private readonly updateUserProfileUseCase: UpdateUserProfileUseCase,
  ) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Request() req): Promise<GetUserByIdResponse> {
    return this.getUserByIdUseCase.execute(req.user.sub);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  async updateMe(@Body() dto: UpdateUserProfileRequest, @Request() req): Promise<UpdateUserProfileResponse> {
    return this.updateUserProfileUseCase.execute(req.user.sub, dto);
  }
}
