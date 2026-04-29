import { randomUUID } from 'crypto';

export interface CreatePasswordResetTokenParams {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}

export interface ReconstructPasswordResetTokenParams {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  used: boolean;
}

export class PasswordResetToken {
  private readonly _id: string;
  private readonly _userId: string;
  private readonly _tokenHash: string;
  private readonly _expiresAt: Date;
  private readonly _used: boolean;

  private constructor(params: ReconstructPasswordResetTokenParams) {
    this._id = params.id;
    this._userId = params.userId;
    this._tokenHash = params.tokenHash;
    this._expiresAt = params.expiresAt;
    this._used = params.used;
  }

  static create(params: CreatePasswordResetTokenParams): PasswordResetToken {
    return new PasswordResetToken({
      id: params.id,
      userId: params.userId,
      tokenHash: params.tokenHash,
      expiresAt: params.expiresAt,
      used: false,
    });
  }

  static reconstruct(params: ReconstructPasswordResetTokenParams): PasswordResetToken {
    return new PasswordResetToken(params);
  }

  get id(): string {
    return this._id;
  }

  get userId(): string {
    return this._userId;
  }

  get tokenHash(): string {
    return this._tokenHash;
  }

  get expiresAt(): Date {
    return this._expiresAt;
  }

  get used(): boolean {
    return this._used;
  }

  isExpired(): boolean {
    return new Date() > this._expiresAt;
  }
}
