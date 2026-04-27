import { DomainException } from './domain.exception';

export class ListNotFoundException extends DomainException {
  constructor() {
    super('Lista no encontrada');
  }
}
