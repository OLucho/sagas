# Clean Architecture — Conceptos Avanzados para Entrevista

> Guia teorico-practica para entender Clean Architecture, DDD y patrones relacionados.
> Pensada para explicar en una entrevista SSR fullstack con confianza.

---

## Indice

1. [Que es Clean Architecture](#que-es-clean-architecture)
2. [La regla de dependencias](#la-regla-de-dependencias)
3. [Las cuatro capas en detalle](#las-cuatro-capas-en-detalle)
4. [Domain-Driven Design (DDD)](#domain-driven-design-ddd)
5. [Patrones de diseno que usa](#patrones-de-diseno-que-usa)
6. [SOLID en la practica](#solid-en-la-practica)
7. [Comparacion con otras arquitecturas](#comparacion-con-otras-arquitecturas)
8. [Ventajas y desventajas](#ventajas-y-desventajas)
9. [Cuando usarla y cuando NO](#cuando-usarla-y-cuando-no)
10. [Testing en Clean Architecture](#testing-en-clean-architecture)
11. [Anti-patrones comunes](#anti-patrones-comunes)
12. [Preguntas de entrevista tipicas](#preguntas-de-entrevista-tipicas)

---

## Que es Clean Architecture

Clean Architecture fue propuesta por **Robert C. Martin (Uncle Bob)** en 2012. La idea central es una:

> **Las reglas de negocio no deben depender de detalles de infraestructura.**

En una app tradicional, el codigo de negocio importa el ORM, el framework web, la base de datos. Si cambias de PostgreSQL a MongoDB, tu logica de negocio se rompe. Clean Architecture invierte esa dependencia: la infraestructura depende del negocio, no al reves.

### La analogia del cable

Imagina que tu app es un televisor:
- El **televisor** (domain) no sabe si recibe la senal por cable, antena o streaming.
- El **televisor** define una entrada HDMI (interface).
- El **cable HDMI** (infrastructure) se conecta al televisor, no al reves.

Tu regla de negocio "un usuario no puede tener dos listas con el mismo nombre" no sabe ni le importa si los datos viven en PostgreSQL, SQLite o en memoria.

---

## La regla de dependencias

`
Presentation ----> Application ----> Domain
Infrastructure ----> Application ----> Domain
Infrastructure ----> Application
`

La flecha significa "depende de" o "conoce a":

- **Presentation** (controllers) depende de **Application** (use cases) — conoce los use cases pero no los repositorios
- **Application** (use cases) depende de **Domain** (entidades, interfaces) — conoce las entidades pero no la base de datos
- **Domain** no depende de NADIE — es TypeScript puro, sin imports de ningun framework
- **Infrastructure** depende de **Application** y **Domain** — implementa las interfaces que Application definio

### La regla de oro

**La dependencia siempre apunta hacia adentro.** Las capas internas no conocen a las externas. Si en tu entidad de dominio hay un import de TypeORM, MikroORM, Express, o cualquier framework, **ya no es Clean Architecture**.

---

## Las cuatro capas en detalle

### 1. Domain — El corazon

Es tu modelo de negocio puro. Sin decorators, sin ORM, sin HTTP.

**Que va aca:**
- Entidades (User, List, CollectionCard)
- Value Objects (si los hay)
- Excepciones de dominio (UserAlreadyExistsException)
- Interfaces de servicios de dominio (IPasswordHasher, IAuthTokenService)

**Que NO va aca:**
- Decoradores de ORM (@Entity, @Column)
- Decoradores de validacion (@IsEmail, @IsString)
- Imports de cualquier framework
- Logica de persistencia (SQL, queries)

**Patron de creacion:**

`	ypescript
export class User {
  private readonly _id: string;
  private readonly _email: string;

  // Constructor privado — no se puede hacer new User() directamente
  private constructor(params: ReconstructUserParams) { ... }

  // Factory method para crear desde cero (valida reglas de negocio)
  static create(params: CreateUserParams): User {
    if (!params.email.includes('@')) throw new InvalidEmailException();
    return new User({ ...params, id: randomUUID(), createdAt: new Date() });
  }

  // Reconstructor para crear desde la DB (sin validacion — los datos ya son validos)
  static reconstruct(params: ReconstructUserParams): User {
    return new User(params);
  }

  get id(): string { return this._id; }
  get email(): string { return this._email; }
}
`

Por que dos factory methods?
- create() — cuando el usuario se registra. Valida todo, genera ID, timestamp.
- econstruct() — cuando lees de la DB. Los datos ya son validos, no validas de nuevo.

Esto evita un bug clasico: re-validar datos que ya pasaron por la DB, o generar nuevos IDs para registros existentes.

### 2. Application — Los use cases

Cada use case es UNA accion del sistema. Una carpeta = un archivo principal + DTOs + interface de repositorio.

`
sign-up/
  sign-up.use-case.ts         ← logica
  sign-up.request.dto.ts       ← entrada
  sign-up.response.dto.ts      ← salida
  interfaces/
    create-user.repository.interface.ts  ← que necesita del repositorio
  README.md                    ← documentacion
`

**Por que un repository interface POR use case?**

`	ypescript
// BIEN: interface chica, unica responsabilidad
export interface ICreateUserRepository {
  create(user: User): Promise<void>;
  existsByEmail(email: string): Promise<boolean>;
}

// MAL: repository gordo — viola Interface Segregation
export interface IUserRepository {
  create(user: User): Promise<void>;
  getByEmail(email: string): Promise<User | null>;
  getById(id: string): Promise<User | null>;
  update(user: User): Promise<void>;
  delete(id: string): Promise<void>;
}
`

El repository gordo obliga a cada use case a depender de metodos que no usa. Si CreateUserUseCase solo necesita create y existsByEmail, por que deberia depender de delete? Esto viola el **Principio de Segregacion de Interfaces (ISP)**.

En la practica, una sola clase UserRepository puede implementar multiples interfaces chicas. Es la implementacion la que se une, no la interface.

**El use case no sabe de HTTP:**

`	ypescript
@Injectable()
export class SignUpUseCase {
  constructor(
    @Inject('ICreateUserRepository') private readonly userRepo: ICreateUserRepository,
    @Inject('IPasswordHasher') private readonly hasher: IPasswordHasher,
  ) {}

  async execute(dto: SignUpRequest): Promise<SignUpResponse> {
    const exists = await this.userRepo.existsByEmail(dto.email);
    if (exists) throw new UserAlreadyExistsException();

    const hash = await this.hasher.hash(dto.password);
    const user = User.create({ email: dto.email, passwordHash: hash, username: dto.username });
    await this.userRepo.create(user);

    return new SignUpResponse(user.id, user.username);
  }
}
`

No hay 	ry/catch. No hay es.status(). No hay eq.body. Es logica de negocio pura orquestando pasos.

### 3. Infrastructure — Las implementaciones

Aca viven los detalles que el dominio no quiere conocer:

- **ORM entities**: clases con decoradores @Entity, @PrimaryKey, @Property
- **Mappers**: funciones puras que convierten domain entity <-> ORM entity
- **Repositories**: implementan las interfaces, usan em.transactional()
- **Security**: bcrypt, JWT, HMAC — implementaciones de las interfaces de dominio
- **Exception filters**: convierten domain exceptions en respuestas HTTP

**El Mapper es la frontera:**

`	ypescript
export class UserMapper {
  static toDomain(orm: UserOrmEntity): User {
    return User.reconstruct({
      id: orm.id,
      email: orm.email,
      passwordHash: orm.passwordHash,
      username: orm.username,
      whatsapp: orm.whatsapp ?? undefined,
      instagram: orm.instagram ?? undefined,
      createdAt: orm.createdAt,
    });
  }

  static toOrm(domain: User): UserOrmEntity {
    const entity = new UserOrmEntity();
    entity.id = domain.id;
    entity.email = domain.email;
    entity.passwordHash = domain.passwordHash;
    entity.username = domain.username;
    entity.whatsapp = domain.whatsapp ?? null;
    entity.instagram = domain.instagram ?? null;
    entity.createdAt = domain.createdAt;
    return entity;
  }
}
`

El mapper es el unico lugar donde la entity de dominio y la entity de ORM se tocan. Si cambias de MikroORM a Prisma, solo reescribes el mapper y el ORM entity — el dominio no cambia.

### 4. Presentation — La puerta de entrada

Controllers delgados. Una linea por endpoint:

`	ypescript
@Post('signup')
@HttpCode(201)
async signUp(@Body() dto: SignUpRequest): Promise<SignUpResponse> {
  return this.signUpUseCase.execute(dto);
}
`

No hay 	ry/catch. Los exception filters globales se encargan de mapear exceptions a HTTP.

---

## Domain-Driven Design (DDD)

DDD y Clean Architecture son conceptos diferentes pero complementarios:
- **Clean Architecture** = regla de dependencias (las capas)
- **DDD** = como modelar el dominio (las entidades, los conceptos)

### Conceptos clave de DDD

| Concepto | Que es | Ejemplo en Sagas |
|----------|--------|-----------------|
| **Entity** | Objeto con identidad unica (ID), mutable | User, List |
| **Value Object** | Objeto sin identidad, inmutable, se compara por valor | Un Email o Money (no lo usamos todavia) |
| **Aggregate** | Grupo de entities tratadas como una unidad | List + ListCard (la lista es el root) |
| **Aggregate Root** | La entity por donde se accede al aggregate | List — no se crean ListCard sin una lista |
| **Domain Service** | Logica que no pertenece a una sola entity | IPasswordHasher — no es del User, es del dominio |
| **Repository** | Abstraccion de persistencia para un aggregate | ICreateListRepository |
| **Domain Event** | Algo que paso en el dominio (para desacoplar) | No lo usamos todavia |

### Entity vs Value Object

| | Entity | Value Object |
|---|--------|-------------|
| **Identidad** | Tiene ID propio | No tiene ID |
| **Mutabilidad** | Puede cambiar | Siempre inmutable |
| **Igualdad** | Por ID | Por todos sus campos |
| **Ejemplo** | User con id bc-123 | Email con valor juan@gmail.com |

Dos users con el mismo email son diferentes si tienen distinto ID. Dos emails juan@gmail.com son iguales siempre.

### Aggregate Root — por que importa

Un **aggregate** es un cluster de objetos que deben ser consistentes juntos. El **aggregate root** es la unica entrada:

`
List (aggregate root)
  ├── name: string
  ├── isPublic: boolean
  └── ListCard[] (dentro del aggregate)
       ├── cardId
       └── variants
`

Regla: **nunca** modificas un ListCard directamente. Siempre a traves de la List que lo contiene. Esto garantiza consistencia — no puedes agregar una carta a una lista que no existe.

En nuestra implementacion, los ListCard tienen su propia tabla por temas de persistencia, pero conceptualmente pertenecen al aggregate de List.

---

## Patrones de diseno que usa

### 1. Repository Pattern

**Problema:** El use case necesita leer/escribir datos, pero no debe conocer SQL ni el ORM.

**Solucion:** Una interface que define QUE operaciones necesita, no COMO las hace.

`	ypescript
// La interface (en Application)
export interface ICreateListRepository {
  create(list: List): Promise<void>;
  existsByName(name: string, userId: string): Promise<boolean>;
}

// La implementacion (en Infrastructure)
export class ListRepository implements ICreateListRepository, IFindListByIdRepository, ... {
  constructor(private readonly em: EntityManager) {}

  async create(list: List): Promise<void> {
    return this.em.transactional(async (em) => {
      const entity = ListMapper.toOrm(list);
      em.persist(entity);
      await em.flush();
    });
  }
}
`

**Por que no un repository generico?**

`	ypescript
// MAL — acoplamiento generico
export class GenericRepository<T> {
  findById(id: string): Promise<T>;
  save(entity: T): Promise<void>;
}
`

Los repositories genericos:
- Obligan a la misma interfaz para todos los aggregates (no todos se leen igual)
- No expresan la intencion del negocio ("buscar por email" vs "findById")
- Se convierten en un Dios-repositorio con metodos que nadie usa

### 2. Factory Method

User.create() y User.reconstruct() son factory methods. Encapsulan la creacion con validacion, de modo que no puedes crear un User invalido.

`	ypescript
// BIEN — no puedes crear un user sin email
const user = User.create({ email: '', passwordHash: '...', username: 'juan' }); // throw!

// MAL — puedes crear un objeto invalido
const user = new User();
user.email = ''; // sin validacion
`

### 3. Dependency Inversion (DIP)

El use case depende de una interface, la implementacion se inyecta:

`	ypescript
// El use case no sabe si usa BCrypt, Argon2, o un mock
constructor(@Inject('IPasswordHasher') private readonly hasher: IPasswordHasher) {}
`

Esto permite:
- En produccion: inyectar BCryptPasswordHasher
- En tests: inyectar un mock que retorna un hash fijo
- Cambiar de bcrypt a argon2 sin tocar el use case

### 4. Mapper Pattern

Separa el modelo de dominio del modelo de persistencia. El dominio dice "un user tiene email", la DB dice "la columna email es varchar(255) not null". El mapper traduce entre ambos.

### 5. Observer (Exception Filters)

Los exception filters de NestJS implementan el patron Observer. El use case lanza una exception, el filter la observa y la transforma. El use case no sabe que existe HTTP.

---

## SOLID en la practica

### S — Single Responsibility

Cada use case tiene UNA responsabilidad. CreateListUseCase solo crea listas. No busca, no actualiza, no elimina.

Cada repository interface tiene UNA responsabilidad. ICreateListRepository solo define lo que CreateListUseCase necesita.

### O — Open/Closed

Agregas funcionalidad agregando use cases, no modificando los existentes. Quieres "duplicar lista"? Creas DuplicateListUseCase. No tocas CreateListUseCase.

### L — Liskov Substitution

Cualquier clase que implemente IPasswordHasher debe ser reemplazable por cualquier otra. BCryptPasswordHasher y MockPasswordHasher son intercambiables.

### I — Interface Segregation

Las interfaces de repositorio son chicas. ICreateListRepository no tiene delete porque CreateListUseCase no necesita borrar. Si un use case necesita 2 metodos, la interface tiene 2 metodos, no 8.

### D — Dependency Inversion

Los use cases dependen de abstracciones (interfaces), no de implementaciones. @Inject('ICreateListRepository'), no @Inject(ListRepository).

---

## Comparacion con otras arquitecturas

### vs MVC

| | MVC | Clean Architecture |
|---|-----|-------------------|
| **Capas** | 3 (Model-View-Controller) | 4 (Domain-Application-Infrastructure-Presentation) |
| **Logica de negocio** | En el Model o en el Controller | En Domain + Application |
| **Acoplamiento DB** | El Model suele mapear 1:1 con la tabla | El Domain no conoce la tabla |
| **Testing** | Dificil sin DB | Use cases testeables sin DB |
| **Escala** | Funciona para apps chicas | Brilla en apps medianas/grandes |

### vs Arquitectura en capas (tradicional)

`
Capas tradicional:
  Presentation → Business → Data Access → Database

Clean Architecture:
  Presentation → Application → Domain ← Infrastructure
`

La diferencia: en la arquitectura en capas tradicional, **Business depende de Data Access**. En Clean Architecture, **Application define interfaces que Infrastructure implementa**. La dependencia esta invertida.

### vs Hexagonal Architecture (Ports & Adapters)

Clean Architecture y Hexagonal son practicamente lo mismo con distinto nombre:
- Hexagonal habla de **ports** (interfaces) y **adapters** (implementaciones)
- Clean habla de **capas** y **reglas de dependencia**

| Hexagonal | Clean Architecture |
|-----------|------------------|
| Port (driving) | Use case interface |
| Port (driven) | Repository interface |
| Adapter (primary) | Controller |
| Adapter (secondary) | Repository implementation |

En entrevistas: puedes decir "uso Clean Architecture con conceptos de Hexagonal" y ser preciso.

---

## Ventajas y desventajas

### Ventajas

- **Testeable** — puedes testear cada use case mockeando interfaces, sin levantar DB
- **Independiente del framework** — cambiar de NestJS a Express no toca el dominio
- **Independiente de la DB** — cambiar de PostgreSQL a MongoDB no toca el dominio
- **Legible** — cada carpeta cuenta una historia: "create-list" hace exactamente eso
- **Mantenible** — un bug en repositorios no afecta la logica de negocio
- **Escalable en equipo** — un dev trabaja en un use case sin conflictos con otro
- **Documentacion viva** — la estructura del codigo ES la documentacion

### Desventajas

- **Boilerplate** — un CRUD simple necesita 5-7 archivos (use case, request dto, response dto, repository interface, repository impl, mapper, orm entity)
- **Curva de aprendizaje** — devs junior necesitan tiempo para entender las capas
- **Over-engineering para CRUDs** — si tu app es un ABM simple, es demasiado
- **Indireccion** — para seguir un request, saltas entre 4+ archivos
- **Mas archivos** — una app de 10 endpoints puede tener 60+ archivos

### Cuando vale la pena

`
CRUD simple con 5 tablas?        → No. Usa un scaffold.
App mediana con reglas de negocio? → Si.
App que va a crecer por anos?      → Definitivamente si.
Equipo de 3+ devs?                → Si.
Un solo dev en un side project?   → Depende. Si queres aprender, si.
`

---

## Cuando usarla y cuando NO

### Usar cuando
- La logica de negocio es compleja (no es un simple CRUD)
- Necesitas cambiar de DB o framework en el futuro
- El equipo es de 3+ personas y necesitan convenciones claras
- Vas a tener que testear mucho (finanzas, salud, legal)
- El proyecto va a vivir mas de 6 meses

### NO usar cuando
- Es un prototipo / MVP que vas a tirar en un mes
- Tu app es 90% CRUD sin reglas de negocio
- Eres el unico dev y necesitas shipping rapido
- No hay presupuesto para el boilerplate extra

---

## Testing en Clean Architecture

### La ventaja clave

Los use cases se testean sin base de datos. Mockeas las interfaces y listo:

`	ypescript
describe('CreateListUseCase', () => {
  let useCase: CreateListUseCase;
  let listRepo: ICreateListRepository;

n  beforeEach(() => {
    listRepo = {
      create: vi.fn().mockResolvedValue(undefined),
      existsByName: vi.fn().mockResolvedValue(false),
    };
    useCase = new CreateListUseCase(listRepo);
  });

  it('should create a list', async () => {
    const result = await useCase.execute({ name: 'Mi Lista', userId: 'user-1', isPublic: false });
    expect(listRepo.create).toHaveBeenCalled();
  });

  it('should throw if list name exists', async () => {
    listRepo.existsByName = vi.fn().mockResolvedValue(true);
    await expect(useCase.execute({ name: 'Mi Lista', userId: 'user-1', isPublic: false }))
      .rejects.toThrow(ListAlreadyExistsException);
  });
});
`

No hay DB. No hay ORM. No hay HTTP. Solo logica pura con mocks.

### Piramide de testing

`
        /  E2E  \        ← pocos, lentos, con DB real
       /  Integration \   ← algunos, con DB de test
      /   Unit (use case)  \  ← muchos, rapidos, sin DB
     /  Unit (domain entity) \ ← muchisimos, instantaneos
`

- **Domain entities**: testea validaciones (User.create() con email vacio tira exception)
- **Use cases**: testea la orquestacion con mocks de repositorio
- **Controllers**: testea que deleguen al use case correcto (integration)
- **Repositories**: testea contra una DB real de test (integration)
- **E2E**: testea el flujo completo HTTP → DB → respuesta

### Regla de oro del testing

**Nunca mockees clases concretas.** Solo mockea interfaces.

Si mockeas ListRepository (la clase), estas acoplado a su implementacion. Si mockeas ICreateListRepository (la interface), estas acoplado al contrato, que es lo correcto.

---

## Anti-patrones comunes

### 1. Anemic Domain Model

El anti-patron mas comun en "Clean Architecture": entities que solo tienen getters y setters, sin logica.

`	ypescript
// ANEMICO — la logica esta en el use case, no en la entidad
export class User {
  email: string;
  passwordHash: string;
}

// use-case.ts
if (!user.email.includes('@')) throw new InvalidEmailException(); // deberia estar en User
`

`	ypescript
// RICO — la logica esta donde corresponde
export class User {
  private readonly _email: string;

  static create(params: CreateUserParams): User {
    if (!params.email.includes('@')) throw new InvalidEmailException();
    return new User(params);
  }
}
`

### 2. Fat Repository Interface

Un repository con todos los metodos CRUD. Violacion de ISP.

`	ypescript
// MAL
export interface IUserRepository {
  create(user: User): Promise<void>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  update(user: User): Promise<void>;
  delete(id: string): Promise<void>;
  count(): Promise<number>;
}

// BIEN — una interface por use case
export interface ICreateUserRepository {
  create(user: User): Promise<void>;
  existsByEmail(email: string): Promise<boolean>;
}
`

### 3. Domain entity con decoradores de ORM

`	ypescript
// MAL — el dominio conoce el ORM
@Entity()
export class User {
  @PrimaryKey() id: string;
  @Property() email: string;
}
`

`	ypescript
// BIEN — dominio puro, ORM en infrastructure
// domain/entities/user.entity.ts
export class User {
  private readonly _id: string;
  get id(): string { return this._id; }
}

// infrastructure/database/entities/user.orm-entity.ts
@Entity()
export class UserOrmEntity {
  @PrimaryKey() id: string;
  @Property() email: string;
}
`

### 4. Use case con try/catch

`	ypescript
// MAL — el use case maneja errores HTTP
async execute(dto: SignUpRequest): Promise<SignUpResponse> {
  try {
    const user = User.create(params);
    await this.userRepo.create(user);
    return new SignUpResponse(user.id, user.username);
  } catch (error) {
    throw new HttpException('Bad request', 400); // HTTP en el use case!
  }
}
`

`	ypescript
// BIEN — el use case lanza domain exceptions, los filters las mapean
async execute(dto: SignUpRequest): Promise<SignUpResponse> {
  const exists = await this.userRepo.existsByEmail(dto.email);
  if (exists) throw new UserAlreadyExistsException();
  // ...
}
`

### 5. Controller con logica de negocio

`	ypescript
// MAL — el controller decide la logica
@Post('signup')
async signUp(@Body() dto: SignUpRequest) {
  const exists = await this.userRepo.existsByEmail(dto.email);
  if (exists) {
    return { status: 409, message: 'User already exists' };
  }
  // ...crear usuario...
}
`

`	ypescript
// BIEN — el controller delega
@Post('signup')
@HttpCode(201)
async signUp(@Body() dto: SignUpRequest): Promise<SignUpResponse> {
  return this.signUpUseCase.execute(dto);
}
`

---

## Preguntas de entrevista tipicas

### "Explica Clean Architecture"

> Es un patron arquitectonico donde las dependencias apuntan hacia adentro. El dominio no conoce la infraestructura. Se divide en capas concentricas: Domain (reglas de negocio), Application (casos de uso), Infrastructure (implementaciones tecnicas) y Presentation (HTTP). La clave es que las capas internas definen interfaces y las externas las implementan — eso es Dependency Inversion.

### "En que se diferencia de MVC?"

> MVC mezcla la logica de negocio con la capa de datos. El Model suele ser un 1:1 de la tabla de base de datos. En Clean Architecture, el modelo de dominio es independiente de la persistencia. Ademas, MVC no tiene una regla clara de dependencias — en Clean Architecture, la dependencia siempre apunta hacia adentro.

### "Por que usas interfaces de repositorio chicas en vez de una general?"

> Por el Principio de Segregacion de Interfaces. Cada use case solo necesita ciertos metodos del repositorio. Si le doy una interface con 8 metodos a un use case que usa 2, lo estoy acoplando a metodos que no necesita. Ademas, al ser chicas, son faciles de mockear en tests y de implementar.

### "Como testeas sin base de datos?"

> Los use cases dependen de interfaces, no de implementaciones. En los tests, creo un mock que implementa la interface con datos en memoria. El use case ejecuta su logica contra el mock y yo verifico que llamo a los metodos correctos. No necesito levantar una DB real hasta los tests de integracion.

### "Que pasa si necesitas cambiar de base de datos?"

> Solo cambio la capa de Infrastructure: nuevas ORM entities, nuevos mappers, nuevos repository implementations. El dominio, los use cases, los DTOs y los controllers no se tocan. Eso es posible porque la capa de Application define interfaces ("que necesito") y Infrastructure las implementa ("como lo hago").

### "No es mucho boilerplate?"

> Si, hay mas archivos. Pero cada archivo tiene una unica responsabilidad y es predecible. Cuando buscas un bug, sabes exactamente donde mirar. Cuando agregas funcionalidad, solo creas archivos nuevos sin tocar los existentes. El boilerplate se paga en mantenibilidad a mediano plazo. Para un CRUD de 3 tablas no lo usaria — para una app con reglas de negocio complejas, si.

### "Que es un Value Object y por que lo usarias?"

> Un Value Object es un objeto inmutable sin identidad, que se compara por valor. Por ejemplo, en vez de pasar email: string como string suelto, creas class Email { readonly value: string }. Esto encapsula la validacion ("un email debe tener @") y evita pasar strings invalidos por el sistema. La diferencia con una Entity es que dos Value Objects con los mismos valores son iguales — no hay ID que los distinga.

### "Que es un Aggregate Root?"

> Es la entidad principal de un cluster de objetos que deben ser consistentes juntos. Por ejemplo, una Lista con sus ListCards. Todo acceso a los objetos del aggregate pasa por el root. No puedes crear un ListCard sin pasar por la Lista — eso garantiza que las invariantes del negocio se cumplen ("no puede haber una carta sin lista").

### "Como manejas errores en Clean Architecture?"

> Las validaciones de negocio lanzan domain exceptions (clases que extienden una base). Los use cases las lanzan libremente sin try/catch. En la capa de Presentation, exception filters capturan esas excepciones y las mapean a codigos HTTP (400, 403, 404, 409). De esta forma, el dominio nunca sabe que existe HTTP.

### "Clean Architecture vs Hexagonal Architecture?"

> Son practicamente lo mismo con distinta terminologia. Hexagonal habla de ports (interfaces) y adapters (implementaciones). Clean Architecture habla de capas y reglas de dependencia. Ambas comparten la idea central: el dominio no depende de la infraestructura. La diferencia menor es que Hexagonal enfatiza la simetria de puertos (driving vs driven), mientras que Clean Architecture enfatiza las capas concentricas.

---

## Referencias

- [Clean Architecture - Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Hexagonal Architecture - Alistair Cockburn](https://alistair.cockburn.us/hexagonal-architecture/)
- [Domain-Driven Design - Eric Evans](https://www.domainlanguage.com/ddd/)
- [r-argentina-programa/arquitectura](https://github.com/r-argentina-programa/arquitectura)
- [architecture-guide.md](./architecture-guide.md) — Guia especifica del proyecto Sagas
- [migrations-guide.md](./migrations-guide.md) — Guia de migraciones
