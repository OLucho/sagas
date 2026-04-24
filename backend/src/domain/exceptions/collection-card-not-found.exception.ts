import { DomainException } from './domain.exception';

export class CollectionCardNotFoundException extends DomainException {
  constructor() {
    super('Collection card not found');
  }
}
