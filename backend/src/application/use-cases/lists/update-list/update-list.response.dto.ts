export class UpdateListResponse {
  readonly id: string;
  readonly userId: string;
  readonly name: string;
  readonly isPublic: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(
    id: string,
    userId: string,
    name: string,
    isPublic: boolean,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.id = id;
    this.userId = userId;
    this.name = name;
    this.isPublic = isPublic;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
