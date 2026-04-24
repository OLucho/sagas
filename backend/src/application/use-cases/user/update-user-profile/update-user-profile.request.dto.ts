import { IsString, IsOptional, MinLength } from 'class-validator';

export class UpdateUserProfileRequest {
  @IsString()
  @MinLength(3)
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  whatsapp?: string;

  @IsString()
  @IsOptional()
  instagram?: string;
}
