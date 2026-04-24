import { Injectable, Inject } from '@nestjs/common';
import type { IListByUserRepository } from './interfaces/list-by-user.repository.interface';
import { GetUserListsResponse } from './get-user-lists.response.dto';
import type { List } from '../../../../domain/entities/list.entity';

@Injectable()
export class GetUserListsUseCase {
  constructor(
    @Inject('IListByUserRepository')
    private readonly listRepo: IListByUserRepository,
  ) {}

  async execute(userId: string): Promise<GetUserListsResponse[]> {
    const lists = await this.listRepo.findByUserId(userId);
    return lists.map(listToResponse);
  }
}

function listToResponse(list: List): GetUserListsResponse {
  return new GetUserListsResponse(list.id, list.userId, list.name, list.isPublic, list.createdAt);
}
