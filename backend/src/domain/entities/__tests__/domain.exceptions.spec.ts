import { DomainException } from '../../exceptions/domain.exception';
import { InvalidEmailException } from '../../exceptions/invalid-email.exception';
import { InvalidUsernameException } from '../../exceptions/invalid-username.exception';
import { UserAlreadyExistsException } from '../../exceptions/user-exists.exception';
import { UserNotFoundException } from '../../exceptions/user-not-found.exception';
import { InvalidCredentialsException } from '../../exceptions/invalid-credentials.exception';
import { InvalidListNameException } from '../../exceptions/invalid-list-name.exception';
import { ListAlreadyExistsException } from '../../exceptions/list-exists.exception';
import { ListNotFoundException } from '../../exceptions/list-not-found.exception';
import { ListAccessDeniedException } from '../../exceptions/list-access-denied.exception';
import { InvalidCardIdException } from '../../exceptions/invalid-card-id.exception';
import { InvalidSetIdException } from '../../exceptions/invalid-set-id.exception';
import { CollectionCardNotFoundException } from '../../exceptions/collection-card-not-found.exception';

describe('Domain Exceptions', () => {
  const cases: { ExceptionClass: new () => DomainException; name: string; message: string }[] = [
    {
      ExceptionClass: InvalidEmailException,
      name: 'InvalidEmailException',
      message: 'El formato del email es inválido',
    },
    {
      ExceptionClass: InvalidUsernameException,
      name: 'InvalidUsernameException',
      message: 'El nombre de usuario debe tener al menos 3 caracteres',
    },
    {
      ExceptionClass: UserAlreadyExistsException,
      name: 'UserAlreadyExistsException',
      message: 'Ya existe un usuario con este email',
    },
    {
      ExceptionClass: UserNotFoundException,
      name: 'UserNotFoundException',
      message: 'Usuario no encontrado',
    },
    {
      ExceptionClass: InvalidCredentialsException,
      name: 'InvalidCredentialsException',
      message: 'Email o contraseña incorrectos',
    },
    {
      ExceptionClass: InvalidListNameException,
      name: 'InvalidListNameException',
      message: 'El nombre de la lista es obligatorio',
    },
    {
      ExceptionClass: ListAlreadyExistsException,
      name: 'ListAlreadyExistsException',
      message: 'Ya existe una lista con este nombre para este usuario',
    },
    {
      ExceptionClass: ListNotFoundException,
      name: 'ListNotFoundException',
      message: 'Lista no encontrada',
    },
    {
      ExceptionClass: ListAccessDeniedException,
      name: 'ListAccessDeniedException',
      message: 'No tenés permisos para acceder a esta lista',
    },
    {
      ExceptionClass: InvalidCardIdException,
      name: 'InvalidCardIdException',
      message: 'El ID de la carta es obligatorio',
    },
    {
      ExceptionClass: InvalidSetIdException,
      name: 'InvalidSetIdException',
      message: 'El ID del set es obligatorio',
    },
    {
      ExceptionClass: CollectionCardNotFoundException,
      name: 'CollectionCardNotFoundException',
      message: 'Carta de colección no encontrada',
    },
  ];

  cases.forEach(({ ExceptionClass, name, message }) => {
    describe(name, () => {
      it(`should be an instance of DomainException`, () => {
        const exception = new ExceptionClass();
        expect(exception).toBeInstanceOf(DomainException);
      });

      it(`should have the name "${name}"`, () => {
        const exception = new ExceptionClass();
        expect(exception.name).toBe(name);
      });

      it(`should have the correct Spanish message`, () => {
        const exception = new ExceptionClass();
        expect(exception.message).toBe(message);
      });
    });
  });
});
