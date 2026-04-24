import { IsString } from 'class-validator';

export class GetCollectionBySetRequest {
  @IsString()
  setId: string;

  constructor(setId: string) {
    this.setId = setId;
  }
}
