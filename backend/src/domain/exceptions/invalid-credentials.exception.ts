import { DomainException } from './domain.exception';

export class InvalidCredentialsException extends DomainException {
  constructor() {
    super('Email o contraseña incorrectos');
  }
}