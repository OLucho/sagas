import { Injectable, Inject } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { ICreateListRepository } from './interfaces/create-list.repository.interface';
import { CreateListRequest } from './create-list.request.dto';
import { CreateListResponse } from './create-list.response.dto';
import { List } from '../../../../domain/entities/list.entity';
import { ListAlreadyExistsException } from '../../../../domain/exceptions/list-exists.exception';

@Injectable()
export class CreateListUseCase {
  constructor(
    @Inject('ICreateListRepository')
    private readonly listRepo: ICreateListRepository,
  ) {}

  async execute(userId: string, request: CreateListRequest): Promise<CreateListResponse> {
    const exists = await this.listRepo.existsByName(userId, request.name);
    if (exists) {
      throw new ListAlreadyExistsException();
    }

    const list = List.create({
      id: randomUUID(),
      userId,
      name: request.name,
      isPublic: request.isPublic,
    });

    await this.listRepo.create(list);

    return new CreateListResponse(list.id, list.createdAt);
  }
}
