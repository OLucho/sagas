import { DomainException } from './domain.exception';

export class InvalidListNameException extends DomainException {
  constructor() {
    super('El nombre de la lista es obligatorio');
  }
}
