import { IsString } from 'class-validator';

export class MarkCardAsNeedRequest {
  @IsString()
  setId: string;

  @IsString()
  cardId: string;

  constructor(setId: string, cardId: string) {
    this.setId = setId;
    this.cardId = cardId;
  }
}
