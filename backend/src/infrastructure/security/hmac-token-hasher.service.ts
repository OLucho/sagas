import { Injectable } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'crypto';
import { ITokenHasher } from '../../domain/services/token-hasher.service';

@Injectable()
export class HmacTokenHasher implements ITokenHasher {
  private readonly secret: string;

  constructor() {
    this.secret = process.env.TOKEN_HASH_SECRET || 'sagas-default-token-secret-change-in-prod';
  }

  async hash(token: string): Promise<string> {
    return createHmac('sha256', this.secret).update(token).digest('hex');
  }

  async compare(token: string, hash: string): Promise<boolean> {
    const computedHash = createHmac('sha256', this.secret).update(token).digest('hex');
    if (computedHash.length !== hash.length) {
      return false;
    }
    return timingSafeEqual(Buffer.from(computedHash), Buffer.from(hash));
  }
}