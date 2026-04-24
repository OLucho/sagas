import { DomainException } from './domain.exception';

export class InvalidSetIdException extends DomainException {
  constructor() {
    super('Set ID is required');
  }
}
