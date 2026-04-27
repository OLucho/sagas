import { DomainException } from './domain.exception';

export class ListAccessDeniedException extends DomainException {
  constructor() {
    super('No tenés permisos para acceder a esta lista');
  }
}
