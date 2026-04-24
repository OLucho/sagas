import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { IAuthTokenService, AuthTokenPayload } from '../../domain/services/auth-token.service';

@Injectable()
export class JwtTokenService implements IAuthTokenService {
  private readonly secret = process.env.JWT_SECRET || 'super-secret-token';

  sign(payload: AuthTokenPayload): string {
    return jwt.sign(payload, this.secret, { expiresIn: '1d' });
  }

  verify(token: string): AuthTokenPayload {
    return jwt.verify(token, this.secret) as AuthTokenPayload;
  }
}
