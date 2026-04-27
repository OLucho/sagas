import { Injectable, Inject } from '@nestjs/common';
import type { IRemoveCardFromListRepository } from './interfaces/remove-card-from-list.repository.interface';
import type { IFindListByIdRepository } from '../../lists/get-list-by-id/interfaces/find-list-by-id.repository.interface';
import { ListNotFoundException } from '../../../../domain/exceptions/list-not-found.exception';
import { ListAccessDeniedException } from '../../../../domain/exceptions/list-access-denied.exception';

@Injectable()
export class RemoveCardFromListUseCase {
  constructor(
    @Inject('IRemoveCardFromListRepository')
    private readonly listCardRepo: IRemoveCardFromListRepository,
    @Inject('IFindListByIdRepository')
    private readonly listRepo: IFindListByIdRepository,
  ) {}

  async execute(listId: string, cardId: string, userId: string): Promise<void> {
    const list = await this.listRepo.findById(listId);
    if (!list) {
      throw new ListNotFoundException();
    }
    if (list.userId !== userId) {
      throw new ListAccessDeniedException();
    }
    await this.listCardRepo.delete(listId, cardId);
  }
}
