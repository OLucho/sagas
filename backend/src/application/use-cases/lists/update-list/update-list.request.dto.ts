import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class UpdateListRequest {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
