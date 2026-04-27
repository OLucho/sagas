import { DomainException } from './domain.exception';

export class CollectionCardNotFoundException extends DomainException {
  constructor() {
    super('Carta de colección no encontrada');
  }
}
