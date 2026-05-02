# Sagas

**A Pokemon TCG collection manager for sellers**

## What is Sagas?

Sagas helps Pokemon TCG sellers in Argentina organize their card inventory, track variants (normal, holofoil, reverse holofoil, 1st edition), and share public lists with their customers. It replaces spreadsheets and Instagram photos with a proper tool.

Key features:

- Browse the entire Pokemon TCG database (15,000+ cards across 150+ sets) via the Pokemon TCG API
- Track which card variants you own in your personal collection
- Mark cards as "need" to build want-lists
- Create custom lists (e.g. "For Sale", "Wishlist") and add cards with specific variant quantities
- Share public list links with customers — no signup required to view
- Password reset via email with time-limited codes
- Rate limiting on sensitive endpoints

## Architecture

Sagas follows **Clean Architecture** with a strict dependency rule: outer layers depend on inner layers, never the reverse.

```
┌─────────────────────────────────────────────┐
│  Presentation (Controllers, Guards)          │
│    ↕ depends on                              │
│  Application (Use Cases, DTOs, Repos IFaces) │
│    ↕ depends on                              │
│  Domain (Entities, Exceptions, Services)     │
│                                              │
│  Infrastructure (ORM, Repos, Security)       │
│    → implements Domain + Application         │
└─────────────────────────────────────────────┘
```

### Domain Layer (`backend/src/domain/`)

Pure TypeScript classes with zero framework dependencies. Entities use static factory methods (`create` / `reconstruct`), enforce invariants, and throw domain exceptions. No decorators, no ORM, no validation annotations.

### Application Layer (`backend/src/application/`)

Each use case is one folder with one responsibility. A use case contains: the use case class, request/response DTOs, a repository interface, and a README. Repository interfaces are scoped per use case (not fat god-repositories). Use cases orchestrate domain logic without knowing about HTTP or databases.

### Infrastructure Layer (`backend/src/infrastructure/`)

Implements what the application layer declares: ORM entities (MikroORM decorators), repository implementations (with transactions), mappers (pure functions for Domain ↔ ORM conversion), security services (bcrypt, JWT, HMAC), and exception filters (map domain exceptions to HTTP).

### Presentation Layer (`backend/src/presentation/`)

Thin controllers that delegate entirely to use cases. No business logic, no try/catch. Guards inject domain service interfaces (`IAuthTokenService`), never raw libraries.

### Frontend (`frontend/`)

Next.js app with App Router. Server Components for pages, Client Components for interactivity. Uses the Pokemon TCG API directly from the client for card data, and the Sagas backend API for user data, collections, and lists. UI built with shadcn/ui + Tailwind CSS. Auth state in React context + localStorage.

## Tech Stack

| Layer | Tech |
|-------|------|
| Backend | NestJS, MikroORM (SQLite dev / PostgreSQL prod), class-validator |
| Frontend | Next.js 16, React 19, Tailwind CSS 4, shadcn/ui |
| Auth | JWT + bcrypt, HMAC-SHA256 for reset tokens |
| Email | Nodemailer (Resend SMTP) |
| External API | Pokemon TCG API v2 |
| Dev Database | SQLite (file-based, zero config) |
| Prod Database | PostgreSQL 16 (Docker Compose) |
| Containerization | Docker + Docker Compose |

## Project Structure

```
sagas/
├── backend/                  # NestJS API
│   ├── src/
│   │   ├── domain/           # Pure entities, exceptions, service interfaces
│   │   ├── application/      # Use cases, DTOs, repository interfaces
│   │   ├── infrastructure/   # ORM entities, mappers, repos, security, filters
│   │   ├── presentation/     # Controllers, guards
│   │   ├── migrations/       # MikroORM migrations
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── Dockerfile
│   └── docker-compose.yml    # (at root)
├── frontend/                 # Next.js app
│   ├── app/                  # App Router pages
│   ├── components/           # React components
│   ├── hooks/
│   ├── lib/                  # API client, auth context, types
│   └── styles/
├── docker-compose.yml        # PostgreSQL + Backend
└── AGENTS.md                 # Architecture rules for AI agents
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Backend

```bash
cd backend
cp .env.example .env   # Edit with your SMTP and secrets
npm install
npm run start:dev       # Starts on :3001 with SQLite
```

### Frontend

```bash
cd frontend
npm install
npm run dev             # Starts on :3000
```

### Docker (Production)

```bash
# Set real secrets in backend/.env
docker compose up --build
```

## Environment Variables

See `backend/.env.example` and `frontend/.env.example` for all required variables.

Key vars:

- `JWT_SECRET` — Signs auth tokens (change in production!)
- `TOKEN_HASH_SECRET` — Hashes password reset codes (change in production!)
- `SMTP_*` — Email provider config (Resend, Brevo, etc.)
- `NEXT_PUBLIC_API_URL` — Backend URL for the frontend
- `CORS_ORIGINS` — Comma-separated allowed origins
- `DB_*` — PostgreSQL connection (production only)

## API Overview

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/signup | No | Create account |
| POST | /api/auth/signin | No | Login, get JWT |
| POST | /api/auth/forgot-password | No | Request reset code (rate limited) |
| POST | /api/auth/reset-password | No | Reset with code (rate limited) |
| GET | /api/users/me | JWT | Get current user |
| PATCH | /api/users/me | JWT | Update profile |
| GET | /api/lists | JWT | Get user's lists |
| POST | /api/lists | JWT | Create list |
| GET | /api/lists/:id | Optional | Get list (public or owner) |
| PATCH | /api/lists/:id | JWT | Update list |
| DELETE | /api/lists/:id | JWT | Delete list |
| GET/POST/PATCH/DELETE | /api/lists/:id/cards/* | JWT | Manage list cards |
| GET | /api/collections | JWT | Get user's collection |
| POST/PATCH | /api/collections/:setId/cards/:cardId | JWT | Update collection |
| GET | /api/health | No | Health check |

## License

UNLICENSED — private project.
