import { DomainException } from './domain.exception';

export class InvalidResetTokenException extends DomainException {
  constructor() {
    super('Código inválido o expirado');
  }
}
