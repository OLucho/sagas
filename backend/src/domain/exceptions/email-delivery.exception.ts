import { DomainException } from './domain.exception';

export class EmailDeliveryException extends DomainException {
  constructor() {
    super('No se pudo enviar el email. Intenta de nuevo mas tarde.');
  }
}