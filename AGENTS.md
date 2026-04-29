# Sagas — Agent Rules

This document captures the architectural decisions, design patterns, and coding conventions for the Sagas backend (NestJS + SQLite/PostgreSQL) and frontend (Next.js). It is derived from the [r-argentina-programa/arquitectura](https://github.com/r-argentina-programa/arquitectura) reference.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Domain Layer Rules](#domain-layer-rules)
3. [Application Layer Rules](#application-layer-rules)
4. [Infrastructure Layer Rules](#infrastructure-layer-rules)
5. [Presentation Layer Rules](#presentation-layer-rules)
6. [Repository Pattern](#repository-pattern)
7. [Dependency Injection](#dependency-injection)
8. [Exception Handling](#exception-handling)
9. [DTO & Validation](#dto--validation)
10. [Authentication & Security](#authentication--security)
11. [Database Configuration](#database-configuration)
12. [Naming & Folder Conventions](#naming--folder-conventions)
13. [Build & Run Commands](#build--run-commands)

---

## Architecture Overview

```
src/
├── domain/              # Pure entities, value objects, domain services, exceptions
│   ├── entities/
│   ├── exceptions/
│   └── services/
├── application/         # Use cases, repository interfaces, DTOs
│   └── use-cases/
│       └── {domain}/
│           └── {action}-{entity}/
│               ├── {action}-{entity}.use-case.ts
│               ├── {action}-{entity}.request.dto.ts
│               ├── {action}-{entity}.response.dto.ts
│               ├── {action}-{entity}.repository.interface.ts
│               └── README.md
├── infrastructure/      # ORM entities, repository impl, external services, exception filters
│   ├── database/
│   │   ├── entities/          # MikroORM entities (decorators allowed ONLY here)
│   │   ├── mappers/           # Domain entity <-> ORM entity mapping
│   │   ├── repositories/      # Transaction-aware repository implementations
│   │   └── database.module.ts
│   ├── security/              # Password hashing, JWT token service
│   └── exceptions/            # NestJS exception filters mapping domain exceptions to HTTP
└── presentation/            # Controllers, guards, pipes
    ├── controllers/
    └── guards/
```

**Dependency direction:**
- Presentation → Application → Domain
- Infrastructure → Domain + Application

---

## Domain Layer Rules

### 1. Entities are pure
- Zero framework dependencies
- Zero decorators (no `@Entity`, no `@PrimaryKey`, no `class-validator`)
- Plain TypeScript classes with a static factory and a static reconstructor

```typescript
// ✅ CORRECT
export class User {
  private readonly _id: string;

  private constructor(params: ReconstructUserParams) { ... }

  static create(params: CreateUserParams): User { ... }
  static reconstruct(params: ReconstructUserParams): User { ... }

  get id(): string { return this._id; }
}

// ❌ INCORRECT
@Entity()
export class User {
  @PrimaryKey() id: string;   // Decorators belong in Infrastructure
}
```

### 2. Domain exceptions
- All business-rule violations throw domain exceptions
- They extend `DomainException` (base class in `domain/exceptions/domain.exception.ts`)
- They are NEVER caught inside controllers or use cases — exception filters handle them

```typescript
export class ListAlreadyExistsException extends DomainException {
  constructor() {
    super('A list with this name already exists for this user');
  }
}
```

### 3. Domain services are interfaces
- Password hashing, token generation, etc. are defined as interfaces here
- Implementations live in Infrastructure

---

## Application Layer Rules

### 1. Use cases have one responsibility
- One use case = one folder = one CRUD operation or domain action
- They are decorated with `@Injectable()`

```typescript
@Injectable()
export class CreateListUseCase {
  constructor(
    @Inject('ICreateListRepository')
    private readonly listRepo: ICreateListRepository,
  ) {}

  async execute(dto: CreateListRequest): Promise<CreateListResponse> {
    // ... pure orchestration, no HTTP knowledge, no raw password logic
  }
}
```

### 2. Every use case MUST have:
- A `README.md` explaining inputs, outputs, and side effects
- `.request.dto.ts` (class with `class-validator` decorators)
- `.response.dto.ts`
- `.repository.interface.ts` (owned by the use case)

### 3. No manual try/catch in use cases
- Throw domain exceptions freely
- Let the infrastructure exception filters map them to HTTP codes

---

## Repository Pattern

### 1. One repository interface per use case
```typescript
// ✅ CORRECT
export interface ICreateUserRepository {
  create(user: User): Promise<void>;
  existsByEmail(email: string): Promise<boolean>;
}

// ❌ INCORRECT (fat repository)
export interface IUserRepository {
  create(user: User): Promise<void>;
  getByEmail(email: string): Promise<User | null>;
  update(user: User): Promise<void>;
  delete(id: string): Promise<void>;
  // ... etc
}
```

### 2. Always use transactions
```typescript
async create(user: User): Promise<void> {
  return this.em.transactional(async (em) => {
    const entity = UserMapper.toOrm(user);
    em.persist(entity);
    await em.flush();
  });
}
```

### 3. Repository implementations live in Infrastructure
- They depend on MikroORM entities (decorated ORM classes)
- They use a Mapper to convert between ORM entity and Domain entity
- Multiple repository interfaces can share a single implementation class if they query the same table

---

## Infrastructure Layer Rules

### 1. ORM entities live here ONLY
```typescript
@Entity({ tableName: 'users' })
export class UserOrmEntity {
  @PrimaryKey()
  id: string;
  // ...
}
```

### 2. Mappers are pure functions
```typescript
export class UserMapper {
  static toDomain(entity: UserOrmEntity): User { ... }
  static toOrm(domain: User): UserOrmEntity { ... }
}
```

### 3. Security implementations
- `BCryptPasswordHasher` implements `IPasswordHasher`
- `HmacTokenHasher` implements `ITokenHasher`
- `JwtTokenService` implements `IAuthTokenService`
- Authentication use cases inject these interfaces, never raw libraries

> **Token vs Password hashing**: Use `ITokenHasher` (fast HMAC-SHA256) for short-lived, single-use secrets (e.g. 6-digit reset codes). Use `IPasswordHasher` (slow bcrypt) for persisted user passwords.
>
> Rationale: bcrypt's cost factor is intentional for passwords (offline attack resistance), but is overkill and a DoS vector for tokens that are already rate-limited and time-bounded.

---

## Presentation Layer Rules

### 1. Controllers are thin
- No business logic
- No `try/catch` blocks (filters handle errors)
- They delegate entirely to use cases

```typescript
@Post('signup')
@HttpCode(201)
async signUp(@Body() dto: SignUpRequest): Promise<SignUpResponse> {
  return this.signUpUseCase.execute(dto); // ✅ Clean
}
```

### 2. Exception filters map domain exceptions to HTTP
- `DomainExceptionFilter` → 400 Bad Request
- `UserAlreadyExistsFilter` → 409 Conflict
- `ListAlreadyExistsFilter` → 409 Conflict
- Register them globally in `main.ts`

### 3. Guards inject interfaces
- `JwtAuthGuard` injects `IAuthTokenService`, not a raw JWT library

---

## Dependency Injection

### 1. Inject interfaces, never concrete classes (outside tests)
```typescript
@Injectable()
export class SignUpUseCase {
  constructor(
    @Inject('ICreateUserRepository')
    private readonly userRepository: ICreateUserRepository,
    @Inject('IPasswordHasher')
    private readonly passwordHasher: IPasswordHasher,
  ) {}
}
```

### 2. Module provider registration
```typescript
@Module({
  providers: [
    { provide: 'ICreateUserRepository', useClass: UserRepository },
    { provide: 'IPasswordHasher', useClass: BCryptPasswordHasher },
    { provide: 'IAuthTokenService', useClass: JwtTokenService },
  ],
})
```

### 3. No use of string constants for tokens
- The token string is the interface name, e.g. `'ICreateUserRepository'`

---

## DTO & Validation

### 1. Request DTOs are classes, not interfaces
```typescript
export class SignUpRequest {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}
```

### 2. Response DTOs have explicit constructors
```typescript
export class SignUpResponse {
  constructor(
    readonly userId: string,
    readonly username: string,
  ) {}
}
```

### 3. Global ValidationPipe
```typescript
app.useGlobalPipes(
  new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
);
```

---

## Authentication & Security

### 1. Password hashing is in the use case
- Use case receives raw password in request DTO
- Hashes via `IPasswordHasher` before creating the domain entity
- The domain entity stores `passwordHash`, never raw password

### 2. JWT signing is in the use case (via `IAuthTokenService`)
- `SignInUseCase` receives credentials, verifies, then asks `IAuthTokenService` to sign a token
- Guards verify tokens via `IAuthTokenService`

### 3. Never use raw libraries (`bcrypt`, `jsonwebtoken`) outside Infrastructure

---

## Database Configuration

### Development
```
driver: SqliteDriver
dbName: ./sagas.sqlite
```

### Production (future)
```
driver: PostgreSqlDriver
clientUrl: postgresql://user:pass@host:5432/db
```

### Rules
- Use `autoLoadEntities: true` to avoid duplicate entity registration
- Remove `entities: [...]` from `forRoot()` when using `autoLoadEntities`
- Use `em.transactional()` in every write operation

---

## Naming & Folder Conventions

| Where | Rule |
|-------|------|
| Folders | `kebab-case`: `sign-up`, `create-list`, `get-user-by-email` |
| Use cases | PascalCase ending with UseCase: `CreateListUseCase` |
| Repository interfaces | PascalCase starting with `I`: `ICreateListRepository` |
| DTOs | PascalCase ending with Request / Response: `CreateListRequest` |
| Domain entities | PascalCase: `User`, `List` |
| ORM entities | PascalCase ending with OrmEntity: `UserOrmEntity` |
| Mappers | PascalCase ending with Mapper: `UserMapper` |
| No barrel files (`index.ts`) anywhere | ✅ Direct imports only |

---

## Build & Run Commands

```bash
cd backend
npm install
npm run build          # Compile TypeScript
npm run start:dev      # Watch mode
npm run start:prod     # Production
npm run test           # Unit tests
npm run test:e2e       # E2E tests
```

```bash
cd frontend
npm install
npm run dev            # Next.js dev server (localhost:3000)
npm run build          # Production build
```

---

## Import Rules (No Barrel Files)

```typescript
// ✅ CORRECT — direct import
import { User } from '../../../../domain/entities/user.entity';

// ❌ INCORRECT — barrel file
import { User } from '../../../../domain/entities';
```

---

## Testing Rules

- Unit test use cases by mocking repository interfaces
- Never mock concrete repository classes
- E2E tests use an in-memory database (`better-sqlite3`) or a test SQLite file

---

## Documentation Rule

Every use case folder contains a `README.md` documenting:
1. What the use case does
2. Input contract (request DTO fields)
3. Output contract (response DTO fields)
4. Business rules and side effects

---

## PostgreSQL Migration Checklist (Future)

When switching from SQLite to PostgreSQL:

```
1. Install: npm install @mikro-orm/postgresql
2. Change driver: SqliteDriver → PostgreSqlDriver in database.module.ts
3. Change dbName → clientUrl in database.module.ts
4. Add environment variables: DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME
5. Keep autoLoadEntities: true
6. Run schema sync in dev, migrations in prod
```
