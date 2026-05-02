# Sagas Backend

NestJS API following Clean Architecture with MikroORM (SQLite for dev, PostgreSQL for prod).

## Architecture

```
src/
├── domain/                        # Pure business logic
│   ├── entities/                  # User, List, CollectionCard, ListCard, PasswordResetToken
│   ├── exceptions/                # DomainException + specific exceptions
│   └── services/                  # Interfaces: IAuthTokenService, IPasswordHasher, ITokenHasher, IEmailService
├── application/                   # Use cases (one folder per action)
│   └── use-cases/
│       ├── auth/                   # sign-up, sign-in, request-password-reset, reset-password
│       ├── collection/             # get-all-collections, get-collection-by-set, update-card-in-collection, mark-card-as-need
│       ├── list-cards/             # add-card-to-list, get-list-cards, remove-card-from-list, update-list-card
│       ├── lists/                  # create-list, delete-list, get-list-by-id, get-user-lists, update-list
│       └── user/                   # get-user-by-id, update-user-profile
├── infrastructure/                 # Framework-specific implementations
│   ├── database/
│   │   ├── entities/              # MikroORM decorated entities (UserOrmEntity, etc.)
│   │   ├── mappers/               # Pure functions: Domain ↔ ORM conversion
│   │   ├── repositories/          # Transaction-aware implementations
│   │   ├── database.module.ts     # DI wiring
│   │   └── mikro-orm.config.ts    # CLI config for migrations
│   ├── exceptions/                # NestJS exception filters (Domain → HTTP mapping)
│   ├── security/                  # BCryptPasswordHasher, HmacTokenHasher, JwtTokenService
│   └── services/                  # NodemailerEmailService
├── presentation/                  # HTTP entry points
│   ├── controllers/              # AuthController, ListController, CollectionController, UserController, HealthController
│   └── guards/                    # JwtAuthGuard, OptionalJwtAuthGuard
├── migrations/                    # MikroORM migration files
├── app.module.ts                  # Root module (conditional SQLite/PostgreSQL)
└── main.ts                        # Bootstrap, CORS, filters, migration runner
```

## Key Design Decisions

### Dependency Direction
```
Presentation → Application → Domain
Infrastructure → Domain + Application
```
The domain never imports anything from outer layers. Application depends only on domain. Infrastructure implements what application declares.

### Domain Entities
Pure TypeScript classes with:
- Private constructor (enforce factory methods)
- `static create()` — validates invariants, throws domain exceptions
- `static reconstruct()` — rehydrates from persistence, no validation
- Read-only getters — no public setters, mutation through methods

```typescript
// Example: User entity
export class User {
  private constructor(params: ReconstructUserParams) { ... }
  static create(params: CreateUserParams): User { /* validates */ }
  static reconstruct(params: ReconstructUserParams): User { /* no validation */ }
  get id(): string { return this._id; }
}
```

### Use Cases (One Responsibility Per Folder)
Each use case folder contains exactly:
- `{action}-{entity}.use-case.ts` — orchestrates domain logic
- `{action}-{entity}.request.dto.ts` — input with class-validator decorators
- `{action}-{entity}.response.dto.ts` — output
- `interfaces/{action}-{entity}.repository.interface.ts` — scoped repository interface
- `README.md` — documents inputs, outputs, and side effects

### Repository Pattern (Interface Per Use Case)
Not fat god-repositories. Each use case declares only the methods it needs:
```typescript
// ICreateUserRepository — only what SignUpUseCase needs
export interface ICreateUserRepository {
  create(user: User): Promise<void>;
  existsByEmail(email: string): Promise<boolean>;
}
```
Multiple interfaces can share one implementation class, registered via DI tokens.

### Database Driver Selection
Configured by `NODE_ENV`:
- `development` → SQLite (`./sagas.sqlite`, schema auto-sync)
- `production` → PostgreSQL (connection via `DB_*` env vars, migrations on startup)

### Transactions
All write operations in repositories use `em.transactional()`:
```typescript
async create(user: User): Promise<void> {
  return this.em.transactional(async (em) => {
    const entity = UserMapper.toOrm(user);
    em.persist(entity);
    await em.flush();
  });
}
```

### Exception Handling Flow
1. Use case throws a domain exception (e.g. `UserAlreadyExistsException`)
2. NestJS exception filter catches it (e.g. `UserAlreadyExistsFilter`)
3. Filter maps to the correct HTTP status (e.g. 409 Conflict)
4. Internal error details are logged server-side, never exposed to the user

### Security
- **Passwords**: bcrypt via `IPasswordHasher` (slow, DoS-resistant)
- **JWT**: Signed via `IAuthTokenService`, verified in guards
- **Reset tokens**: HMAC-SHA256 via `ITokenHasher` (fast, for short-lived codes)
- **Rate limiting**: ThrottlerGuard globally (60s/10 req), stricter on auth endpoints

## Running

### Development (SQLite)
```bash
npm install
cp .env.example .env    # set SMTP_* and secrets
npm run start:dev       # http://localhost:3001
```

### Production (PostgreSQL via Docker)
```bash
docker compose up --build   # from project root
```

### Tests
```bash
npm test          # Unit tests (76 tests)
npm run test:e2e  # E2E tests
```

### Migrations
```bash
# Development: schema auto-sync (no migrations needed)
# Production: migrations run automatically on startup
# Manual: npx mikro-orm migration:create
#         npx mikro-orm migration:up
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | `development` or `production` |
| `JWT_SECRET` | Yes | Secret for signing JWT tokens |
| `TOKEN_HASH_SECRET` | Yes | Secret for hashing reset codes |
| `SMTP_HOST` | Yes | SMTP server hostname |
| `SMTP_PORT` | Yes | SMTP port (587 for STARTTLS, 465 for SSL) |
| `SMTP_USER` | Yes | SMTP username |
| `SMTP_PASS` | Yes | SMTP password |
| `SMTP_FROM` | Yes | Sender email address |
| `CORS_ORIGINS` | No | Comma-separated allowed origins (default: localhost) |
| `DB_HOST` | Prod | PostgreSQL host |
| `DB_PORT` | Prod | PostgreSQL port |
| `DB_USERNAME` | Prod | PostgreSQL user |
| `DB_PASSWORD` | Prod | PostgreSQL password |
| `DB_NAME` | Prod | Database name |
| `DB_SSL` | Prod | `true` for managed PostgreSQL |
| `PORT` | No | Server port (default: 3001) |