import { Module } from '@nestjs/common';
import { BCryptPasswordHasher } from './bcrypt-password.service';
import { JwtTokenService } from './jwt-token.service';

@Module({
  providers: [
    {
      provide: 'IPasswordHasher',
      useClass: BCryptPasswordHasher,
    },
    {
      provide: 'IAuthTokenService',
      useClass: JwtTokenService,
    },
  ],
  exports: ['IPasswordHasher', 'IAuthTokenService'],
})
export class SecurityModule {}
