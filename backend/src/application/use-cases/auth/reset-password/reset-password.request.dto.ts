import { IsString, IsEmail, MinLength, Length, Matches } from 'class-validator';

export class ResetPasswordRequest {
  @IsEmail()
  email: string;

  @IsString()
  @Length(6, 6)
  @Matches(/^\d{6}$/, { message: 'El código debe ser numérico de 6 dígitos' })
  code: string;

  @IsString()
  @MinLength(6)
  password: string;
}
