import { DomainException } from './domain.exception';

export class UserAlreadyExistsException extends DomainException {
  constructor() {
    super('User with this email already exists');
  }
}