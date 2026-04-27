import { DomainException } from './domain.exception';

export class InvalidSetIdException extends DomainException {
  constructor() {
    super('El ID del set es obligatorio');
  }
}
