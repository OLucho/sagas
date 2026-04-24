import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateListRequest {
  @IsString()
  name: string;

  @IsOptional()
  @IsBoolean()
  isPublic: boolean = false;
}
