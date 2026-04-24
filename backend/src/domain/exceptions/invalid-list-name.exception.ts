import { DomainException } from './domain.exception';

export class InvalidListNameException extends DomainException {
  constructor() {
    super('List name is required');
  }
}
