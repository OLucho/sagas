export class CreateListResponse {
  readonly id: string;
  readonly createdAt: Date;

  constructor(id: string, createdAt: Date) {
    this.id = id;
    this.createdAt = createdAt;
  }
}