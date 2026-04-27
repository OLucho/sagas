import { InvalidListNameException } from '../../domain/exceptions/invalid-list-name.exception';

export interface CreateListParams {
  id: string;
  userId: string;
  name: string;
  isPublic: boolean;
}

export interface ReconstructListParams {
  id: string;
  userId: string;
  name: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class List {
  private readonly _id: string;
  private _userId: string;
  private _name: string;
  private _isPublic: boolean;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(params: ReconstructListParams) {
    this._id = params.id;
    this._userId = params.userId;
    this._name = params.name;
    this._isPublic = params.isPublic;
    this._createdAt = params.createdAt;
    this._updatedAt = params.updatedAt;
  }

  static create(params: CreateListParams): List {
    if (!params.name || params.name.trim().length === 0) {
      throw new InvalidListNameException();
    }
    return new List({
      id: params.id,
      userId: params.userId,
      name: params.name,
      isPublic: params.isPublic,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static reconstruct(params: ReconstructListParams): List {
    return new List(params);
  }

  updateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new InvalidListNameException();
    }
    this._name = name;
    this._updatedAt = new Date();
  }

  updateVisibility(isPublic: boolean): void {
    this._isPublic = isPublic;
    this._updatedAt = new Date();
  }

  get id(): string {
    return this._id;
  }

  get userId(): string {
    return this._userId;
  }

  get name(): string {
    return this._name;
  }

  get isPublic(): boolean {
    return this._isPublic;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }
}
