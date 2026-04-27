import { DomainException } from './domain.exception';

export class ListAlreadyExistsException extends DomainException {
  constructor() {
    super('Ya existe una lista con este nombre para este usuario');
  }
}