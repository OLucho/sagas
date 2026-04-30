import { DomainException } from './domain.exception';

export class EmailDeliveryException extends DomainException {
  constructor(originalError?: string) {
    super(originalError ? `No se pudo enviar el email: ${originalError}` : 'No se pudo enviar el email. Intenta de nuevo mas tarde.');
  }
}