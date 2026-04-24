import { IsString } from 'class-validator';

export class GetListByIdRequest {
  @IsString()
  id: string;

  constructor(id: string) {
    this.id = id;
  }
}
