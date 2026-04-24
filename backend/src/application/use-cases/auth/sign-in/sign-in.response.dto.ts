export class SignInResponse {
  readonly token: string;
  readonly userId: string;
  readonly username: string;

  constructor(token: string, userId: string, username: string) {
    this.token = token;
    this.userId = userId;
    this.username = username;
  }
}
