export class SignUpResponse {
  readonly userId: string;
  readonly username: string;

  constructor(userId: string, username: string) {
    this.userId = userId;
    this.username = username;
  }
}
