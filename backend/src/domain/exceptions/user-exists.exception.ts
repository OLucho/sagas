import { DomainException } from './domain.exception';

export class UserAlreadyExistsException extends DomainException {
  constructor() {
    super('Ya existe un usuario con este email');
  }
}