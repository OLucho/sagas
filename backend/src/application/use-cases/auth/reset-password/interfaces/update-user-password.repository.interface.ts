export interface IResetPasswordAtomicRepository {
  updatePasswordAndInvalidateToken(userId: string, passwordHash: string, tokenId: string): Promise<void>;
}
