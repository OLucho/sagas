import { DomainException } from './domain.exception';

export class InvalidCardIdException extends DomainException {
  constructor() {
    super('El ID de la carta es obligatorio');
  }
}
