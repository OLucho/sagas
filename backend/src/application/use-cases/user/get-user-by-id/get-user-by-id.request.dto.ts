import { IsString } from 'class-validator';

export class GetUserByIdRequest {
  @IsString()
  userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }
}
