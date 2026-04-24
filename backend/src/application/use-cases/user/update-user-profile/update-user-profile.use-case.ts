import { Injectable, Inject } from '@nestjs/common';
import { User } from '../../../../domain/entities/user.entity';
import { InvalidUsernameException } from '../../../../domain/exceptions/invalid-username.exception';
import { UserNotFoundException } from '../../../../domain/exceptions/user-not-found.exception';
import type { IUpdateUserProfileRepository } from './interfaces/update-user-profile.repository.interface';
import { UpdateUserProfileRequest } from './update-user-profile.request.dto';
import { UpdateUserProfileResponse } from './update-user-profile.response.dto';

@Injectable()
export class UpdateUserProfileUseCase {
  constructor(
    @Inject('IUpdateUserProfileRepository')
    private readonly userRepo: IUpdateUserProfileRepository,
  ) {}

  async execute(userId: string, dto: UpdateUserProfileRequest): Promise<UpdateUserProfileResponse> {
    const user = await this.userRepo.getById(userId);
    if (!user) {
      throw new UserNotFoundException();
    }

    const username = dto.username !== undefined ? dto.username.trim() : user.username;
    if (username.length < 3) {
      throw new InvalidUsernameException();
    }

    const updatedUser = User.reconstruct({
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      username,
      createdAt: user.createdAt,
      whatsapp:
        dto.whatsapp !== undefined && dto.whatsapp.trim() !== ''
          ? dto.whatsapp.trim()
          : undefined,
      instagram:
        dto.instagram !== undefined && dto.instagram.trim() !== ''
          ? dto.instagram.trim()
          : undefined,
    });

    await this.userRepo.update(updatedUser);

    return new UpdateUserProfileResponse(
      updatedUser.id,
      updatedUser.email,
      updatedUser.username,
      updatedUser.whatsapp,
      updatedUser.instagram,
    );
  }
}
