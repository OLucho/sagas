import { Injectable, Inject } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { ICreateUserRepository } from './interfaces/create-user.repository.interface';
import type { IPasswordHasher } from '../../../../domain/services/password.service';
import { SignUpRequest } from './sign-up.request.dto';
import { SignUpResponse } from './sign-up.response.dto';
import { User } from '../../../../domain/entities/user.entity';
import { UserAlreadyExistsException } from '../../../../domain/exceptions/user-exists.exception';

@Injectable()
export class SignUpUseCase {
  constructor(
    @Inject('ICreateUserRepository')
    private readonly userRepository: ICreateUserRepository,
    @Inject('IPasswordHasher')
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  async execute(request: SignUpRequest): Promise<SignUpResponse> {
    const exists = await this.userRepository.existsByEmail(request.email);
    if (exists) {
      throw new UserAlreadyExistsException();
    }

    const passwordHash = await this.passwordHasher.hash(request.password);

    const user = User.create({
      id: randomUUID(),
      email: request.email,
      passwordHash,
      username: request.username,
      whatsapp: request.whatsapp,
      instagram: request.instagram,
    });

    await this.userRepository.create(user);

    return new SignUpResponse(user.id, user.username);
  }
}
