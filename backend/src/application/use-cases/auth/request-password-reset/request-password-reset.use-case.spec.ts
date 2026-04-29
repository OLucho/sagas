import { RequestPasswordResetUseCase } from './request-password-reset.use-case';
import { RequestPasswordResetRequest } from './request-password-reset.request.dto';
import { User } from '../../../../domain/entities/user.entity';

const mockUserRepository = {
  getByEmail: jest.fn(),
};

const mockTokenHasher = {
  hash: jest.fn(),
};

const mockEmailService = {
  sendPasswordResetCode: jest.fn(),
};

const mockTokenRepository = {
  save: jest.fn(),
};

describe('RequestPasswordResetUseCase', () => {
  let useCase: RequestPasswordResetUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new RequestPasswordResetUseCase(
      mockUserRepository as any,
      mockTokenHasher as any,
      mockEmailService as any,
      mockTokenRepository as any,
    );
  });

  it('should create token and send email for existing user', async () => {
    const user = User.create({
      id: 'user-1',
      email: 'test@example.com',
      passwordHash: 'hash',
      username: 'testuser',
    });
    mockUserRepository.getByEmail.mockResolvedValue(user);
    mockTokenHasher.hash.mockResolvedValue('hashed-code');
    mockTokenRepository.save.mockResolvedValue(undefined);
    mockEmailService.sendPasswordResetCode.mockResolvedValue(undefined);

    const dto = new RequestPasswordResetRequest();
    dto.email = 'test@example.com';

    const result = await useCase.execute(dto);

    expect(mockUserRepository.getByEmail).toHaveBeenCalledWith('test@example.com');
    expect(mockTokenHasher.hash).toHaveBeenCalled();
    expect(mockEmailService.sendPasswordResetCode).toHaveBeenCalledWith('test@example.com', expect.any(String));
    expect(mockTokenRepository.save).toHaveBeenCalled();
    expect(result.success).toBe(true);
  });

  it('should silently return success for non-existing user (no enumeration)', async () => {
    mockUserRepository.getByEmail.mockResolvedValue(null);

    const dto = new RequestPasswordResetRequest();
    dto.email = 'notfound@example.com';

    const result = await useCase.execute(dto);

    expect(result.success).toBe(true);
    expect(mockEmailService.sendPasswordResetCode).not.toHaveBeenCalled();
    expect(mockTokenRepository.save).not.toHaveBeenCalled();
  });
});
