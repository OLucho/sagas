export class GetListByIdResponse {
  readonly id: string;
  readonly userId: string;
  readonly name: string;
  readonly isPublic: boolean;
  readonly createdAt: Date;

  constructor(
    id: string,
    userId: string,
    name: string,
    isPublic: boolean,
    createdAt: Date,
  ) {
    this.id = id;
    this.userId = userId;
    this.name = name;
    this.isPublic = isPublic;
    this.createdAt = createdAt;
  }
}
