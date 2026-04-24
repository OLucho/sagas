import { IsObject, IsString } from 'class-validator';

export class UpdateCardInCollectionRequest {
  @IsString()
  setId: string;

  @IsString()
  cardId: string;

  @IsObject()
  variants: Record<string, number>;

  constructor(setId: string, cardId: string, variants: Record<string, number>) {
    this.setId = setId;
    this.cardId = cardId;
    this.variants = variants;
  }
}
