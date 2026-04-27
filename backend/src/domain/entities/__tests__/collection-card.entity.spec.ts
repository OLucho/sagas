import { CollectionCard } from '../collection-card.entity';
import { InvalidCardIdException } from '../../exceptions/invalid-card-id.exception';
import { InvalidSetIdException } from '../../exceptions/invalid-set-id.exception';

describe('CollectionCard', () => {
  const validCreateParams = {
    id: 'cc-1',
    userId: 'user-1',
    cardId: 'card-1',
    setId: 'set-1',
    variants: { normal: 2, foil: 1 },
    needed: false,
  };

  const validReconstructParams = {
    id: 'cc-1',
    userId: 'user-1',
    cardId: 'card-1',
    setId: 'set-1',
    variants: { normal: 2, foil: 1 },
    needed: false,
  };

  describe('create', () => {
    it('should create a collection card with valid params', () => {
      const card = CollectionCard.create(validCreateParams);

      expect(card.id).toBe(validCreateParams.id);
      expect(card.userId).toBe(validCreateParams.userId);
      expect(card.cardId).toBe(validCreateParams.cardId);
      expect(card.setId).toBe(validCreateParams.setId);
      expect(card.variants).toEqual(validCreateParams.variants);
      expect(card.needed).toBe(validCreateParams.needed);
    });

    it('should throw InvalidCardIdException for empty cardId', () => {
      expect(() =>
        CollectionCard.create({ ...validCreateParams, cardId: '' }),
      ).toThrow(InvalidCardIdException);
    });

    it('should throw InvalidSetIdException for empty setId', () => {
      expect(() =>
        CollectionCard.create({ ...validCreateParams, setId: '' }),
      ).toThrow(InvalidSetIdException);
    });
  });

  describe('reconstruct', () => {
    it('should reconstruct a collection card from params', () => {
      const card = CollectionCard.reconstruct(validReconstructParams);

      expect(card.id).toBe(validReconstructParams.id);
      expect(card.userId).toBe(validReconstructParams.userId);
      expect(card.cardId).toBe(validReconstructParams.cardId);
      expect(card.setId).toBe(validReconstructParams.setId);
      expect(card.variants).toEqual(validReconstructParams.variants);
      expect(card.needed).toBe(validReconstructParams.needed);
    });
  });

  describe('updateVariants', () => {
    it('should add new variants', () => {
      const card = CollectionCard.create(validCreateParams);
      card.updateVariants({ reverse: 3 });

      expect(card.variants).toEqual({ normal: 2, foil: 1, reverse: 3 });
    });

    it('should merge and overwrite existing variants', () => {
      const card = CollectionCard.create(validCreateParams);
      card.updateVariants({ normal: 5 });

      expect(card.variants).toEqual({ normal: 5, foil: 1 });
    });

    it('should remove zero or negative quantity variants', () => {
      const card = CollectionCard.create(validCreateParams);
      card.updateVariants({ normal: 0, foil: -1 });

      expect(card.variants).toEqual({});
    });
  });

  describe('toggleNeeded', () => {
    it('should toggle needed from false to true', () => {
      const card = CollectionCard.create({ ...validCreateParams, needed: false });
      card.toggleNeeded();

      expect(card.needed).toBe(true);
    });

    it('should toggle needed from true to false', () => {
      const card = CollectionCard.create({ ...validCreateParams, needed: true });
      card.toggleNeeded();

      expect(card.needed).toBe(false);
    });
  });

  describe('getters', () => {
    it('should return correct values', () => {
      const card = CollectionCard.reconstruct(validReconstructParams);

      expect(card.id).toBe('cc-1');
      expect(card.userId).toBe('user-1');
      expect(card.cardId).toBe('card-1');
      expect(card.setId).toBe('set-1');
      expect(card.variants).toEqual({ normal: 2, foil: 1 });
      expect(card.needed).toBe(false);
    });
  });
});
