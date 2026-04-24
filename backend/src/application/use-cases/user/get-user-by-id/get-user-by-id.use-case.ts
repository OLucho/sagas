import { Injectable, Inject } from '@nestjs/common';
import type { IGetUserByIdRepository } from './interfaces/get-user-by-id.repository.interface';
import { GetUserByIdResponse } from './get-user-by-id.response.dto';
import { UserNotFoundException } from '../../../../domain/exceptions/user-not-found.exception';

@Injectable()
export class GetUserByIdUseCase {
  constructor(
    @Inject('IGetUserByIdRepository')
    private readonly userRepo: IGetUserByIdRepository,
  ) {}

  async execute(userId: string): Promise<GetUserByIdResponse> {
    const user = await this.userRepo.getById(userId);
    if (!user) {
      throw new UserNotFoundException();
    }
    return new GetUserByIdResponse(
      user.id,
      user.email,
      user.username,
      user.whatsapp,
      user.instagram,
      user.createdAt,
    );
  }
}
