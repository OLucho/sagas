import { User } from '../user.entity';
import { InvalidEmailException } from '../../exceptions/invalid-email.exception';
import { InvalidUsernameException } from '../../exceptions/invalid-username.exception';

describe('User', () => {
  const validParams = {
    id: 'user-1',
    email: 'test@example.com',
    passwordHash: 'hashed-password',
    username: 'testuser',
    whatsapp: '+1234567890',
    instagram: 'test_insta',
  };

  describe('create', () => {
    it('should create a user with valid params', () => {
      const user = User.create(validParams);

      expect(user.id).toBe(validParams.id);
      expect(user.email).toBe(validParams.email);
      expect(user.passwordHash).toBe(validParams.passwordHash);
      expect(user.username).toBe(validParams.username);
      expect(user.whatsapp).toBe(validParams.whatsapp);
      expect(user.instagram).toBe(validParams.instagram);
      expect(user.createdAt).toBeInstanceOf(Date);
    });

    it('should create a user without optional social fields', () => {
      const user = User.create({
        id: 'user-2',
        email: 'other@example.com',
        passwordHash: 'secret',
        username: 'otheruser',
      });

      expect(user.whatsapp).toBeUndefined();
      expect(user.instagram).toBeUndefined();
    });

    it('should throw InvalidEmailException for email without @', () => {
      expect(() =>
        User.create({ ...validParams, email: 'bademail' }),
      ).toThrow(InvalidEmailException);
    });

    it('should throw InvalidEmailException for email without @', () => {
      expect(() =>
        User.create({ ...validParams, email: 'no-at-sign-here' }),
      ).toThrow(InvalidEmailException);
    });

    it('should throw InvalidUsernameException for short username', () => {
      expect(() =>
        User.create({ ...validParams, username: 'ab' }),
      ).toThrow(InvalidUsernameException);
    });

    it('should throw InvalidUsernameException for empty username', () => {
      expect(() =>
        User.create({ ...validParams, username: '' }),
      ).toThrow(InvalidUsernameException);
    });

    it('should throw InvalidUsernameException for whitespace-only username', () => {
      expect(() =>
        User.create({ ...validParams, username: '   ' }),
      ).toThrow(InvalidUsernameException);
    });
  });

  describe('reconstruct', () => {
    it('should reconstruct a user from params', () => {
      const user = User.reconstruct({
        id: 'user-3',
        email: 'recon@example.com',
        passwordHash: 'hash',
        username: 'reconuser',
        createdAt: new Date('2024-01-01'),
      });

      expect(user.id).toBe('user-3');
      expect(user.createdAt.toISOString()).toBe(new Date('2024-01-01').toISOString());
    });
  });
});
