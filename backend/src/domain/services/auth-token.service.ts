export type AuthTokenPayload = {
  sub: string;
  username: string;
};

export interface IAuthTokenService {
  sign(payload: AuthTokenPayload): string;
  verify(token: string): AuthTokenPayload;
}