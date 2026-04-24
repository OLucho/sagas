import { DomainException } from './domain.exception';

export class InvalidEmailException extends DomainException {
  constructor() {
    super('Invalid email format');
  }
}
