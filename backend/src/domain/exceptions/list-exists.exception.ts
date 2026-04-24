import { DomainException } from './domain.exception';

export class ListAlreadyExistsException extends DomainException {
  constructor() {
    super('A list with this name already exists for this user');
  }
}