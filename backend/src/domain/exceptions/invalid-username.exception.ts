import { DomainException } from './domain.exception';

export class InvalidUsernameException extends DomainException {
  constructor() {
    super('El nombre de usuario debe tener al menos 3 caracteres');
  }
}
