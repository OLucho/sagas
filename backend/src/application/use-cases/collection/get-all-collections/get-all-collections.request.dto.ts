import { IsString } from 'class-validator';

export class GetAllCollectionsRequest {
  @IsString()
  userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }
}
