import { DomainException } from './domain.exception';

export class ListAccessDeniedException extends DomainException {
  constructor() {
    super('You do not have permission to access this list');
  }
}
