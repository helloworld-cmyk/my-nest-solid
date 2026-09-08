# Agents Guide

## Quick commands

- `pnpm install` — install dependencies
- `pnpm run build` — compile TypeScript via Nest CLI
- `pnpm run start:dev` — dev server with watch mode
- `pnpm run lint` — ESLint + Prettier, auto-fixes
- `pnpm run format` — Prettier on `src/` and `test/`
- `pnpm run test` — unit tests (Jest, from `src/`)
- `pnpm run test:e2e` — e2e tests (from `test/`)
- `npx prisma migrate dev` — run Prisma migrations (uses `DB_HOST` from `.env`)
- `npx prisma generate` — regenerate Prisma client

## Verify order

`lint` → `test` → `build`

## Architecture

- **NestJS v11** app, **pnpm** package manager, **Prisma v7** ORM (PostgreSQL)
- Entry: `src/main.ts` → `src/app.module.ts` → `AuthModule`
- Modules live under `src/modules/` (currently only `auth/`)
- DTOs: `src/dto/` (shared `BaseRequest`, `BaseResponse`) and `src/modules/auth/dto/` (module-specific)
- Entities: `src/entites/` (note: typo in folder name — "entites" not "entities")
- Interceptors: `src/interceptor/`
- Repositories: `src/repositories/` (currently empty)

## Prisma

- Schema: `prisma/schema.prisma`
- Config: `prisma.config.ts` — loads `.env` via `dotenv/config`, datasource uses `DB_HOST` env var
- Client output: `generated/prisma` (gitignored)
- After schema changes: `npx prisma migrate dev` then `npx prisma generate`

## TypeScript

- `module: "nodenext"`, `moduleResolution: "nodenext"` — use `.js` extensions in relative imports
- `noImplicitAny: false`, `strictNullChecks: true`
- `emitDecoratorMetadata: true` + `experimentalDecorators: true`

## Linting

- ESLint flat config (`eslint.config.mjs`) with `typescript-eslint` type-checked rules
- `@typescript-eslint/no-explicit-any: off`
- `@typescript-eslint/no-floating-promises: warn`
- `@typescript-eslint/no-unsafe-argument: warn`
- Prettier integrated via `eslint-plugin-prettier`

## Testing

- Unit tests: `*.spec.ts` files in `src/`, Jest rootDir is `src/`
- E2e tests: `*.e2e-spec.ts` in `test/`, separate `jest-e2e.json` config
- Framework: Jest + ts-jest

## Environment

- Copy `.env.example` to `.env`
- Required: `DB_HOST` (PostgreSQL connection string), `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
- `ENVIRONMENT` = `DEV` or `PROD`
- **NEVER read `.env`** — only read `.env.example` for variable reference
