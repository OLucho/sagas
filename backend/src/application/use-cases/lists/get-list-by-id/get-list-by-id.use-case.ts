import { Injectable, Inject } from '@nestjs/common';
import type { IFindListByIdRepository } from './interfaces/find-list-by-id.repository.interface';
import { GetListByIdResponse } from './get-list-by-id.response.dto';
import { ListNotFoundException } from '../../../../domain/exceptions/list-not-found.exception';
import { ListAccessDeniedException } from '../../../../domain/exceptions/list-access-denied.exception';

@Injectable()
export class GetListByIdUseCase {
  constructor(
    @Inject('IFindListByIdRepository')
    private readonly listRepo: IFindListByIdRepository,
  ) {}

  async execute(listId: string, currentUserId: string | null): Promise<GetListByIdResponse> {
    const list = await this.listRepo.findById(listId);
    if (!list) {
      throw new ListNotFoundException();
    }
    if (!list.isPublic && list.userId !== currentUserId) {
      throw new ListAccessDeniedException();
    }
    return new GetListByIdResponse(list.id, list.userId, list.name, list.isPublic, list.createdAt);
  }
}
