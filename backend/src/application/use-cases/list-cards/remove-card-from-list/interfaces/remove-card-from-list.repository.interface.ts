export interface IRemoveCardFromListRepository {
  delete(listId: string, cardId: string): Promise<void>;
}
