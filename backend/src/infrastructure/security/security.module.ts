import { Module } from '@nestjs/common';
import { BCryptPasswordHasher } from './bcrypt-password.service';
import { JwtTokenService } from './jwt-token.service';
import { HmacTokenHasher } from './hmac-token-hasher.service';
 
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
    {
      provide: 'ITokenHasher',
      useClass: HmacTokenHasher,
    },
  ],
  exports: ['IPasswordHasher', 'IAuthTokenService', 'ITokenHasher'],
})
export class SecurityModule {}
