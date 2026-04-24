import { DomainException } from './domain.exception';

export class InvalidCardIdException extends DomainException {
  constructor() {
    super('Card ID is required');
  }
}
