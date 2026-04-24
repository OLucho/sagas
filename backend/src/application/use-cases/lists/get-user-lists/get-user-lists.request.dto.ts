import { IsString } from 'class-validator';

export class GetUserListsRequest {
  @IsString()
  userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }
}
