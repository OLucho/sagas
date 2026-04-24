import { Injectable, Inject } from '@nestjs/common';
import type { IDeleteListRepository } from './interfaces/delete-list.repository.interface';
import { ListNotFoundException } from '../../../../domain/exceptions/list-not-found.exception';
import { ListAccessDeniedException } from '../../../../domain/exceptions/list-access-denied.exception';

@Injectable()
export class DeleteListUseCase {
  constructor(
    @Inject('IDeleteListRepository')
    private readonly listRepo: IDeleteListRepository,
  ) {}

  async execute(listId: string, userId: string): Promise<void> {
    const list = await this.listRepo.findById(listId);
    if (!list) {
      throw new ListNotFoundException();
    }
    if (list.userId !== userId) {
      throw new ListAccessDeniedException();
    }

    await this.listRepo.delete(listId);
  }
}
