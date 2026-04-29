export class RequestPasswordResetResponse {
  readonly success: boolean;

  constructor(success: boolean) {
    this.success = success;
  }
}
