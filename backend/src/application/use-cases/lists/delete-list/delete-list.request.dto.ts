import { IsString } from 'class-validator';

export class DeleteListRequest {
  @IsString()
  listId: string;

  constructor(listId: string) {
    this.listId = listId;
  }
}
