import { DomainException } from './domain.exception';

export class InvalidUsernameException extends DomainException {
  constructor() {
    super('Username must be at least 3 characters');
  }
}
