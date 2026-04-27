import { DomainException } from './domain.exception';

export class InvalidEmailException extends DomainException {
  constructor() {
    super('El formato del email es inválido');
  }
}
