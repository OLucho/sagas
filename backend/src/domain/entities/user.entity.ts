import { InvalidEmailException } from '../../domain/exceptions/invalid-email.exception';
import { InvalidUsernameException } from '../../domain/exceptions/invalid-username.exception';

export interface CreateUserParams {
  id: string;
  email: string;
  passwordHash: string;
  username: string;
  whatsapp?: string;
  instagram?: string;
}

export interface ReconstructUserParams {
  id: string;
  email: string;
  passwordHash: string;
  username: string;
  createdAt: Date;
  whatsapp?: string;
  instagram?: string;
}

export class User {
  private readonly _id: string;
  private readonly _email: string;
  private readonly _passwordHash: string;
  private readonly _username: string;
  private readonly _createdAt: Date;
  private readonly _whatsapp: string | undefined;
  private readonly _instagram: string | undefined;

  private constructor(params: ReconstructUserParams) {
    this._id = params.id;
    this._email = params.email;
    this._passwordHash = params.passwordHash;
    this._username = params.username;
    this._createdAt = params.createdAt;
    this._whatsapp = params.whatsapp;
    this._instagram = params.instagram;
  }

  static create(params: CreateUserParams): User {
    if (!params.email.includes('@')) {
      throw new InvalidEmailException();
    }
    if (!params.username || params.username.trim().length < 3) {
      throw new InvalidUsernameException();
    }

    return new User({
      id: params.id,
      email: params.email,
      passwordHash: params.passwordHash,
      username: params.username,
      createdAt: new Date(),
      whatsapp: params.whatsapp,
      instagram: params.instagram,
    });
  }

  static reconstruct(params: ReconstructUserParams): User {
    return new User(params);
  }

  get id(): string {
    return this._id;
  }

  get email(): string {
    return this._email;
  }

  get passwordHash(): string {
    return this._passwordHash;
  }

  get username(): string {
    return this._username;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get whatsapp(): string | undefined {
    return this._whatsapp;
  }

  get instagram(): string | undefined {
    return this._instagram;
  }
}
