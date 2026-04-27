import { ListCard } from '../list-card.entity';

describe('ListCard', () => {
  const validCreateParams = {
    id: 'lc-1',
    listId: 'list-1',
    cardId: 'card-1',
    variants: { normal: 2, foil: 1 },
  };

  const validReconstructParams = {
    id: 'lc-1',
    listId: 'list-1',
    cardId: 'card-1',
    variants: { normal: 2, foil: 1 },
    addedAt: new Date('2024-01-01'),
  };

  describe('create', () => {
    it('should create a list card with valid params', () => {
      const card = ListCard.create(validCreateParams);

      expect(card.id).toBe(validCreateParams.id);
      expect(card.listId).toBe(validCreateParams.listId);
      expect(card.cardId).toBe(validCreateParams.cardId);
      expect(card.variants).toEqual(validCreateParams.variants);
      expect(card.addedAt).toBeInstanceOf(Date);
    });
  });

  describe('reconstruct', () => {
    it('should reconstruct a list card from params', () => {
      const card = ListCard.reconstruct(validReconstructParams);

      expect(card.id).toBe(validReconstructParams.id);
      expect(card.listId).toBe(validReconstructParams.listId);
      expect(card.cardId).toBe(validReconstructParams.cardId);
      expect(card.variants).toEqual(validReconstructParams.variants);
      expect(card.addedAt.toISOString()).toBe(validReconstructParams.addedAt.toISOString());
    });
  });

  describe('updateVariants', () => {
    it('should replace variants and remove zero or negative quantities', () => {
      const card = ListCard.create(validCreateParams);
      card.updateVariants({ normal: 0, foil: -1, reverse: 3 });

      expect(card.variants).toEqual({ reverse: 3 });
    });

    it('should set variants to empty object when all are zero or negative', () => {
      const card = ListCard.create(validCreateParams);
      card.updateVariants({ normal: 0, foil: 0 });

      expect(card.variants).toEqual({});
    });
  });

  describe('getters', () => {
    it('should return correct values', () => {
      const card = ListCard.reconstruct(validReconstructParams);

      expect(card.id).toBe('lc-1');
      expect(card.listId).toBe('list-1');
      expect(card.cardId).toBe('card-1');
      expect(card.variants).toEqual({ normal: 2, foil: 1 });
      expect(card.addedAt).toBeInstanceOf(Date);
    });
  });
});
