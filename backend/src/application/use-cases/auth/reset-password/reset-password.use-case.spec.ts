import { ResetPasswordUseCase } from './reset-password.use-case';
import { ResetPasswordRequest } from './reset-password.request.dto';
import { User } from '../../../../domain/entities/user.entity';
import { PasswordResetToken } from '../../../../domain/entities/password-reset-token.entity';
import { InvalidResetTokenException } from '../../../../domain/exceptions/invalid-reset-token.exception';

const mockUserRepository = {
  getByEmail: jest.fn(),
};

const mockPasswordHasher = {
  hash: jest.fn(),
};

const mockTokenHasher = {
  hash: jest.fn(),
  compare: jest.fn(),
};

const mockTokenRepository = {
  findByUserId: jest.fn(),
};

const mockResetPasswordAtomicRepository = {
  updatePasswordAndInvalidateToken: jest.fn(),
};

describe('ResetPasswordUseCase', () => {
  let useCase: ResetPasswordUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new ResetPasswordUseCase(
      mockUserRepository as any,
      mockPasswordHasher as any,
      mockTokenHasher as any,
      mockTokenRepository as any,
      mockResetPasswordAtomicRepository as any,
    );
  });

  it('should reset password with valid code', async () => {
    const user = User.create({
      id: 'user-1',
      email: 'test@example.com',
      passwordHash: 'old-hash',
      username: 'testuser',
    });
    const token = PasswordResetToken.create({
      id: 'token-1',
      userId: 'user-1',
      tokenHash: 'hashed-code',
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });
    mockUserRepository.getByEmail.mockResolvedValue(user);
    mockTokenRepository.findByUserId.mockResolvedValue(token);
    mockTokenHasher.compare.mockResolvedValue(true);
    mockPasswordHasher.hash.mockResolvedValue('new-hash');
    mockResetPasswordAtomicRepository.updatePasswordAndInvalidateToken.mockResolvedValue(undefined);

    const dto = new ResetPasswordRequest();
    dto.email = 'test@example.com';
    dto.code = '123456';
    dto.password = 'newpassword123';

    const result = await useCase.execute(dto);

    expect(result.success).toBe(true);
    expect(mockTokenHasher.compare).toHaveBeenCalledWith('123456', 'hashed-code');
    expect(mockPasswordHasher.hash).toHaveBeenCalledWith('newpassword123');
    expect(mockResetPasswordAtomicRepository.updatePasswordAndInvalidateToken).toHaveBeenCalledWith('user-1', 'new-hash', 'token-1');
  });

  it('should throw InvalidResetTokenException when user not found', async () => {
    mockUserRepository.getByEmail.mockResolvedValue(null);

    const dto = new ResetPasswordRequest();
    dto.email = 'missing@example.com';
    dto.code = '123456';
    dto.password = 'newpassword123';

    await expect(useCase.execute(dto)).rejects.toThrow(InvalidResetTokenException);
  });

  it('should throw InvalidResetTokenException when token is expired', async () => {
    const user = User.create({
      id: 'user-1',
      email: 'test@example.com',
      passwordHash: 'old-hash',
      username: 'testuser',
    });
    const token = PasswordResetToken.create({
      id: 'token-1',
      userId: 'user-1',
      tokenHash: 'hashed-code',
      expiresAt: new Date(Date.now() - 1000),
    });
    mockUserRepository.getByEmail.mockResolvedValue(user);
    mockTokenRepository.findByUserId.mockResolvedValue(token);

    const dto = new ResetPasswordRequest();
    dto.email = 'test@example.com';
    dto.code = '123456';
    dto.password = 'newpassword123';

    await expect(useCase.execute(dto)).rejects.toThrow(InvalidResetTokenException);
  });

  it('should throw InvalidResetTokenException when code is invalid', async () => {
    const user = User.create({
      id: 'user-1',
      email: 'test@example.com',
      passwordHash: 'old-hash',
      username: 'testuser',
    });
    const token = PasswordResetToken.create({
      id: 'token-1',
      userId: 'user-1',
      tokenHash: 'hashed-code',
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });
    mockUserRepository.getByEmail.mockResolvedValue(user);
    mockTokenRepository.findByUserId.mockResolvedValue(token);
    mockTokenHasher.compare.mockResolvedValue(false);

    const dto = new ResetPasswordRequest();
    dto.email = 'test@example.com';
    dto.code = '000000';
    dto.password = 'newpassword123';

    await expect(useCase.execute(dto)).rejects.toThrow(InvalidResetTokenException);
  });

  it('should throw InvalidResetTokenException when token already used', async () => {
    const user = User.create({
      id: 'user-1',
      email: 'test@example.com',
      passwordHash: 'old-hash',
      username: 'testuser',
    });
    const token = PasswordResetToken.reconstruct({
      id: 'token-1',
      userId: 'user-1',
      tokenHash: 'hashed-code',
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      used: true,
    });
    mockUserRepository.getByEmail.mockResolvedValue(user);
    mockTokenRepository.findByUserId.mockResolvedValue(token);

    const dto = new ResetPasswordRequest();
    dto.email = 'test@example.com';
    dto.code = '123456';
    dto.password = 'newpassword123';

    await expect(useCase.execute(dto)).rejects.toThrow(InvalidResetTokenException);
  });

  it('should use tokenHasher for code comparison and passwordHasher for new password hash', async () => {
    const user = User.create({
      id: 'user-1',
      email: 'test@example.com',
      passwordHash: 'old-hash',
      username: 'testuser',
    });
    const token = PasswordResetToken.create({
      id: 'token-1',
      userId: 'user-1',
      tokenHash: 'hashed-code',
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });
    mockUserRepository.getByEmail.mockResolvedValue(user);
    mockTokenRepository.findByUserId.mockResolvedValue(token);
    mockTokenHasher.compare.mockResolvedValue(true);
    mockPasswordHasher.hash.mockResolvedValue('new-hash');
    mockResetPasswordAtomicRepository.updatePasswordAndInvalidateToken.mockResolvedValue(undefined);

    const dto = new ResetPasswordRequest();
    dto.email = 'test@example.com';
    dto.code = '123456';
    dto.password = 'newpassword123';

    await useCase.execute(dto);

    expect(mockTokenHasher.compare).toHaveBeenCalledWith('123456', 'hashed-code');
    expect(mockPasswordHasher.hash).toHaveBeenCalledWith('newpassword123');
  });
});
