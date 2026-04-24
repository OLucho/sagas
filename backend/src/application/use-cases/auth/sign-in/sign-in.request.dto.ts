import { IsString, IsEmail, MinLength } from 'class-validator';

export class SignInRequest {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}
