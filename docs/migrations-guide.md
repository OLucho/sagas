# Database Migrations Guide

> A practical and conceptual guide to understanding database migrations — written so you can explain them confidently in an interview.

---

## The Problem Migrations Solve

Imagine you're building an app. On day 1, your database has one table: users. Life is simple.

On day 20, you add a lists table. On day 40, you add a phone column to users. On day 60, you rename phone to whatsapp.

Now here's the question: **how does the production database know about these changes?**

You can't just delete the production database and recreate it — there's real user data in there. You can't manually run ALTER TABLE commands on production and hope you don't forget one.

**Migrations are the solution.** They are a versioned, ordered list of database changes — like git commits, but for your schema.

---

## What Is a Migration?

A migration is a **file** that describes a database change. It has two methods:

- **up()** — applies the change (create table, add column, create index, etc.)
- **down()** — reverts the change (drop table, remove column, drop index, etc.)

Here's a real example from this project:

`	ypescript
// backend/src/migrations/Migration20260430170000.ts
export class Migration20260430170000 extends Migration {
  async up(): Promise<void> {
    this.addSql('create table "users" ("id" varchar(255) not null, "email" varchar(255) not null, ...);');
    this.addSql('create table "lists" ("id" varchar(255) not null, "user_id" varchar(255) not null, ...);');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "users";');
    this.addSql('drop table if exists "lists";');
  }
}
`

The filename includes a **timestamp** (20260430170000), so migrations always run in the order they were created.

---

## The Migration Lifecycle

`
1. You change an ORM entity (add a column, new table, etc.)
2. You run: npx mikro-orm migration:create
3. MikroORM compares your entities vs the current database schema
4. It generates a new migration file with the difference
5. You review the generated SQL
6. You run: npx mikro-orm migration:up
7. The migration executes against the database
8. A tracking table records that this migration was applied
`

### The tracking table

MikroORM creates a hidden table called mikro_orm_migrations in your database. It stores which migrations have already been applied:

`
+----+-------------------------------+---------------------+
| id | name                          | run_at              |
+----+-------------------------------+---------------------+
|  1 | Migration20260430170000.ts     | 2026-04-30 17:00:00 |
+----+-------------------------------+---------------------+
`

When you run migration:up, MikroORM:
1. Reads all migration files from your src/migrations/ folder
2. Checks which ones are already in the tracking table
3. Runs only the ones that haven't been applied yet
4. Records them in the tracking table

This means running migration:up multiple times is **safe** — it won't re-apply migrations that already ran.

---

## Key Concepts for Interviews

### 1. Migrations vs synchronize: true

| | synchronize: true | Migrations |
|---|---|---|
| **What it does** | Auto-diffs entities vs DB and applies changes | Runs explicit migration files in order |
| **Safe for prod?** | **No** — can drop columns with data, no rollback | **Yes** — predictable, reviewable, reversible |
| **Use when** | Local dev only | Production always, dev optionally |
| **Audit trail** | None | Every change is a file in git |

In this project, synchronize: true is used in development (SQLite, fast iteration) and migrations are used in production (PostgreSQL, safety).

### 2. Why not just run raw SQL manually?

- **No ordering** — who remembers which ALTER TABLE ran first?
- **No tracking** — which changes were already applied to production?
- **No rollback** — if something breaks, what do you undo?
- **No collaboration** — your teammate's database won't have your changes
- **No code review** — you can't PR a manual SQL command

Migrations solve all of these because they are **files in git**, just like your code.

### 3. Schema vs Data migrations

- **Schema migration** — changes the structure (CREATE TABLE, ALTER TABLE, DROP COLUMN). This is what most people mean by "migration".
- **Data migration** — changes the data itself (UPDATE users SET role = 'admin' WHERE ...). These are also migration files, but they manipulate rows instead of columns.

Both use the same up()/down() pattern.

### 4. Forward-only migrations

In practice, most teams **never run down() in production**. Instead:
- Apply a new migration that fixes/reverses the previous change
- This is called a **forward-only strategy** or **compensating migration**

Why? Because down() can be dangerous — dropping a column also drops the data in it. The down() method exists as a safety net for local development, but production rollbacks are usually handled by writing a new migration.

### 5. Idempotency

A good migration is **idempotent** — running it twice produces the same result as running it once. MikroORM handles this automatically via the tracking table, but if you write custom SQL, be careful:

`sql
-- Bad: fails if the column already exists
ALTER TABLE users ADD COLUMN phone varchar(255);

-- Better: conditional
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone varchar(255);
`

---

## Commands Cheat Sheet

| Command | What it does |
|---------|-------------|
| 
px mikro-orm migration:create | Generates a new migration from the diff between entities and DB |
| 
px mikro-orm migration:up | Applies all pending migrations |
| 
px mikro-orm migration:down | Reverts the last applied migration |
| 
px mikro-orm migration:pending | Lists migrations not yet applied |
| 
px mikro-orm migration:list | Lists all migrations and their status |

---

## How It Works in This Project

### Development (SQLite)

`
NODE_ENV=development
Driver: SqliteDriver
synchronize: true        ← schema auto-syncs on startup, no migrations needed
`

You change entities, restart the server, and the database updates automatically. Fast iteration, zero friction.

### Production (PostgreSQL / Neon)

`
NODE_ENV=production
Driver: PostgreSqlDriver
synchronize: false       ← schema does NOT auto-sync
Migrations run on startup via main.ts: migrator.up()
`

Every schema change follows this workflow:
1. Modify the ORM entity in src/infrastructure/database/entities/
2. Run 
px mikro-orm migration:create to generate the migration
3. Review the SQL in the generated file
4. Commit the migration file to git
5. On deploy, main.ts automatically runs migrator.up() which applies any pending migrations

### The two configs

| File | Purpose |
|------|---------|
| pp.module.ts (forRootAsync) | Runtime config used by NestJS when the app starts |
| mikro-orm.config.ts | CLI config used when you run 
px mikro-orm commands from the terminal |

Both must agree on the same entities and migrations path, otherwise the CLI won't see what the app sees.

---

## Common Interview Questions

**"What are database migrations?"**
> Version-controlled database schema changes. Each migration is a file with an up() method to apply the change and a down() method to revert it. They run in chronological order and a tracking table ensures they only run once.

**"Why not use synchronize in production?"**
> Because synchronize destructively diffs the schema — it can drop columns or tables that have data. It's also not reproducible: you can't review, version, or rollback the changes. Migrations give you an audit trail, rollback capability, and the ability to code-review schema changes.

**"What happens if two developers create migrations at the same time?"**
> Both migrations get a unique timestamp-based name. They need to be applied in order. If there's a conflict (e.g. both rename the same column), the second migration will fail when it runs. The fix is to communicate, review PRs, and if needed, squash conflicting migrations into one.

**"Can migrations fail in the middle?"**
> Yes. If a migration throws an error partway through, the database can be left in an inconsistent state. Some ORMs wrap migrations in transactions so they roll back on failure, but not all DDL statements can be transactional (e.g. CREATE INDEX CONCURRENTLY in PostgreSQL cannot). This is why you review generated SQL before applying it.

**"What's the difference between a migration and a seed?"**
> A migration changes the **schema** (structure). A seed changes the **data** (content). Migrations run on every environment. Seeds typically only run in dev or test to populate fake data.

**"How do you handle production rollbacks?"**
> The preferred approach is forward-only: write a new migration that reverses the broken change, rather than running down(). This preserves data and creates an audit trail. Running down() can be dangerous because it might drop data.

---

## Visual Analogy

Think of your database schema as a **git repository**:

| Git | Migrations |
|-----|-----------|
| Commits | Migration files |
| git log | migrations tracking table |
| git apply | migration:up |
| git revert | migration:down (or compensating migration) |
| Branches | Don't exist — migrations are linear |
| .git/ | mikro_orm_migrations table |

Every migration is a commit to your database structure. The tracking table is your .git/ folder. Running up is like applying a patch — it only applies what hasn't been applied yet.

---

## References

- [MikroORM Migrations Docs](https://mikro-orm.io/docs/migrations)
- [postgresql-migration.md](./postgresql-migration.md) — Setup guide for this project
- [AGENTS.md](../AGENTS.md) — Project conventions
