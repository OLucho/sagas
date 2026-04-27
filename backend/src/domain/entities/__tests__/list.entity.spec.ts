import { List } from '../list.entity';
import { InvalidListNameException } from '../../exceptions/invalid-list-name.exception';

describe('List', () => {
  const validCreateParams = {
    id: 'list-1',
    userId: 'user-1',
    name: 'My List',
    isPublic: false,
  };

  const validReconstructParams = {
    id: 'list-1',
    userId: 'user-1',
    name: 'My List',
    isPublic: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-02-01'),
  };

  describe('create', () => {
    it('should create a list with valid params', () => {
      const list = List.create(validCreateParams);

      expect(list.id).toBe(validCreateParams.id);
      expect(list.userId).toBe(validCreateParams.userId);
      expect(list.name).toBe(validCreateParams.name);
      expect(list.isPublic).toBe(validCreateParams.isPublic);
      expect(list.createdAt).toBeInstanceOf(Date);
      expect(list.updatedAt).toBeInstanceOf(Date);
    });

    it('should throw InvalidListNameException for empty name', () => {
      expect(() =>
        List.create({ ...validCreateParams, name: '' }),
      ).toThrow(InvalidListNameException);
    });

    it('should throw InvalidListNameException for whitespace-only name', () => {
      expect(() =>
        List.create({ ...validCreateParams, name: '   ' }),
      ).toThrow(InvalidListNameException);
    });
  });

  describe('reconstruct', () => {
    it('should reconstruct a list from params', () => {
      const list = List.reconstruct(validReconstructParams);

      expect(list.id).toBe(validReconstructParams.id);
      expect(list.userId).toBe(validReconstructParams.userId);
      expect(list.name).toBe(validReconstructParams.name);
      expect(list.isPublic).toBe(validReconstructParams.isPublic);
      expect(list.createdAt.toISOString()).toBe(validReconstructParams.createdAt.toISOString());
      expect(list.updatedAt.toISOString()).toBe(validReconstructParams.updatedAt.toISOString());
    });
  });

  describe('updateName', () => {
    it('should update the name and updatedAt', () => {
      const list = List.create(validCreateParams);
      const beforeUpdate = list.updatedAt;

      list.updateName('Updated Name');

      expect(list.name).toBe('Updated Name');
      expect(list.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeUpdate.getTime());
    });

    it('should throw InvalidListNameException for empty name', () => {
      const list = List.create(validCreateParams);
      expect(() => list.updateName('')).toThrow(InvalidListNameException);
    });

    it('should throw InvalidListNameException for whitespace-only name', () => {
      const list = List.create(validCreateParams);
      expect(() => list.updateName('   ')).toThrow(InvalidListNameException);
    });
  });

  describe('updateVisibility', () => {
    it('should update visibility and updatedAt', () => {
      const list = List.create(validCreateParams);
      const beforeUpdate = list.updatedAt;

      list.updateVisibility(true);

      expect(list.isPublic).toBe(true);
      expect(list.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeUpdate.getTime());
    });
  });

  describe('getters', () => {
    it('should return correct values', () => {
      const list = List.reconstruct(validReconstructParams);

      expect(list.id).toBe('list-1');
      expect(list.userId).toBe('user-1');
      expect(list.name).toBe('My List');
      expect(list.isPublic).toBe(true);
      expect(list.createdAt).toBeInstanceOf(Date);
      expect(list.updatedAt).toBeInstanceOf(Date);
    });
  });
});
