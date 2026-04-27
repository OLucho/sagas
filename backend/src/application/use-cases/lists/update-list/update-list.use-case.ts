import { Injectable, Inject } from '@nestjs/common';
import type { IUpdateListRepository } from './interfaces/update-list.repository.interface';
import { UpdateListRequest } from './update-list.request.dto';
import { UpdateListResponse } from './update-list.response.dto';
import { ListNotFoundException } from '../../../../domain/exceptions/list-not-found.exception';
import { ListAccessDeniedException } from '../../../../domain/exceptions/list-access-denied.exception';

@Injectable()
export class UpdateListUseCase {
  constructor(
    @Inject('IUpdateListRepository')
    private readonly listRepo: IUpdateListRepository,
  ) {}

  async execute(listId: string, userId: string, request: UpdateListRequest): Promise<UpdateListResponse> {
    const list = await this.listRepo.findById(listId);
    if (!list) {
      throw new ListNotFoundException();
    }
    if (list.userId !== userId) {
      throw new ListAccessDeniedException();
    }

    if (request.name !== undefined) {
      list.updateName(request.name);
    }
    if (request.isPublic !== undefined) {
      list.updateVisibility(request.isPublic);
    }

    await this.listRepo.save(list);

    return new UpdateListResponse(list.id, list.userId, list.name, list.isPublic, list.createdAt, list.updatedAt);
  }
}
