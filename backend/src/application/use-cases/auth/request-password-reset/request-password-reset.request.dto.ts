import { IsEmail } from 'class-validator';

export class RequestPasswordResetRequest {
  @IsEmail()
  email: string;
}
