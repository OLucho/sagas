export interface IEmailService {
  sendPasswordResetCode(to: string, code: string): Promise<void>;
}
