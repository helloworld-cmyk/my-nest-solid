# Agents Guide

## Quick commands

- `pnpm install` — install dependencies
- `pnpm run build` — compile TypeScript via Nest CLI
- `pnpm run start:dev` — dev server with watch mode (port from `PORT` env, default 3000)
- `pnpm run lint` — ESLint + Prettier, auto-fixes
- `pnpm run format` — Prettier on `src/` and `test/`
- `pnpm run test` — unit tests (Jest, from `src/`)
- `pnpm run test:e2e` — e2e tests (from `test/`)
- `npx prisma migrate dev` — run Prisma migrations (uses `DB_HOST` from `.env`)
- `npx prisma generate` — regenerate Prisma client

## Verify order

`lint` → `test` → `build`

## Architecture

- **NestJS v11** app, **pnpm** package manager, **Prisma v7** ORM (PostgreSQL via `@prisma/adapter-pg` driver adapter)
- Entry: `src/main.ts` → `src/app.module.ts`. `main.ts` registers global `ValidationPipe({ whitelist: true, transform: true })`, `HttpExceptionFilter`, `PrismaExceptionFilter`, `ResponseInterceptor`, and Swagger at `/api-docs` — do not re-register these per module.
- Feature modules live under `src/modules/`: `auth`, `profile`, `category`, `product`, `payment`, `address`. Each module has `*.controller.ts`, `*.service.ts`, `*.module.ts`, and `dto/request/` + `dto/response/`.
- Repositories live in `src/repositories/` (one `*.repository.ts` per Prisma model, kebab-case). Services inject repositories; repositories inject the global `PrismaService` — never use `PrismaService` directly in services or controllers.
- `PrismaModule` (`src/prisma/`) is `@Global()`. `PrismaService` extends `PrismaClient` with the `PrismaPg` adapter and connects/disconnects via lifecycle hooks.
- Shared cross-module DTOs live in `src/dto/` (currently `PaginationQueryDto`, `PaginationMetaDto`); module-specific DTOs live in each module's `dto/`.
- Mappers: `src/utils/converDtoResponse/` (note: typo "conver" in folder name — keep it) — static mapper classes (`ProductResponseMapper`) that convert repository rows into response DTOs.
- Query coercion decorators: `src/utils/transform/` (`TrimToUndefined`, `ToBooleanQuery`, `ToNumberArray`, `ToStringArray`, `ToOptionalNumber`), re-exported from `utils/transform/index.js`.
- Utils: `src/utils/class/hash.ts` (`HashUtils.sha256`, used e.g. for payment card tokens).
- Exception filters: `src/filters/` (`http-exception.ts`, `prisma-exception.ts` mapping P2000/P2002/P2003/P2025/P2006/P2011/P2012/P2014 to HTTP statuses).
- Response interceptor: `src/interceptor/interceptor.ts` — every successful response is wrapped as `{ code: 200, message: 'Success', data }` (`BaseResponse<T>`), and errors are `{ code, message, data: null }`. Services return only the payload `data`; never wrap manually.

## Controllers

- Decorate with `@ApiTags('<plural-resource>')`, `@ApiOperation`, and `@ApiResponse` per endpoint (include success + relevant error statuses, use `HttpStatus` enum).
- Controllers are thin: delegate directly to a service method, no business logic, no repository access.
- Public routes: no guards. Protected routes: `@UseGuards(JwtAuthGuard)` + `@ApiBearerAuth()`. Admin-only routes: `@UseGuards(JwtAdminGuard)`.
- Guards: `src/modules/auth/guard/` (`jwt.guard.ts` → `JwtAuthGuard`, `jwt-admin.guard.ts` → `JwtAdminGuard`, `jwt-token.guard.ts`); strategies: `src/modules/auth/strategy/` registered as passport strategies `'jwt'`, `'jwt-admin'`, `'jwt-token'`.

## Services

- Services contain business logic, throw Nest HTTP exceptions (`NotFoundException`, `ConflictException`, `UnauthorizedException`, `BadRequestException`) with concise English messages — filters handle the response shape.
- Return types are the response DTO (e.g. `Promise<ProductDetailDto>`); mapping from persistence rows happens in `utils/converDtoResponse/` mappers, not inline in services.
- Magic numbers become named module-level constants (e.g. `RELATED_LIMIT`, `HOME_PRODUCTS_SIZE` in `product.service.ts`).
- Default values are applied in the service (`query.page ?? 1`, `query.limit ?? 20`, `query.sort ?? 'newest'`).

## DTOs

- Request DTOs live in `dto/request/`, response DTOs in `dto/response/`; shared base DTOs in `src/dto/`.
- Query DTOs that paginate extend `PaginationQueryDto` from `src/dto/pagination.dto.js`.
- Request DTOs combine OpenAPI decorators + class-validator rules + custom transform decorators from `utils/transform/index.js` for query coercion; validated by the global `ValidationPipe` and never returned to clients.
- Allowed enum values are exported as `const` arrays (e.g. `PRODUCT_LIST_SORTS`) and used with `@IsIn(...)` plus `typeof` for the field type.
- Response DTOs use OpenAPI decorators to describe the response shape. Enum and date shapes are described via OpenAPI metadata.
- Services return data shaped as the response DTO; a Swagger `type:` on the controller is documentation only and never filters runtime data. Raw persistence models are never returned from services.
- Collection endpoints accept a query DTO and return item DTOs shaped for the client rather than mirroring the table; detail-only fields belong in a separate detail DTO.

## Repositories

- One repository per Prisma model, `@Injectable()`, named `<model>.repository.ts`.
- Define reusable `select`/`include` fragments as module-level constants with `satisfies Prisma.<Model>Select` / `satisfies Prisma.<Model>Include`, and derive row types via `Prisma.<Model>GetPayload<{ include: typeof ... }>`.
- Filter objects are plain interfaces (e.g. `ProductListFilter`); build `where` via a private `buildWhere` helper returning `Prisma.<Model>WhereInput`.
- Select only the fields the caller needs and exclude sensitive or internal persistence fields at the query level, never by post-processing the result.
- Paginated reads use `$transaction([findMany, count])` with `normalizePagination`-style helpers (floor page/limit, cap limit at 100, default 20); other list helpers clamp limits (e.g. `clampLimit`).
- Search uses `contains` + `mode: 'insensitive'`; conditional filters are spread in only when defined.

## Auth

- JWT access + refresh tokens with separate secrets (`JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`) and expirations (`JWT_ACCESS_EXP`, `JWT_REFRESH_EXP`) via `ConfigService`.
- `JwtPayload` and `AuthenticatedUser` interfaces live in `src/modules/auth/strategy/jwt.strategy.ts` — reuse them instead of redefining.
- Passwords hashed with `argon2` (`hash`/`verify`); never store or log plaintext passwords.

## Prisma

- Config: `prisma.config.ts` — loads `.env` via `dotenv/config`, datasource uses `DB_HOST` env var.
- Schema is split into multiple files under `prisma/schema/`: `schema.prisma` holds only `generator client` (provider `prisma-client`, output `../generated/prisma`, `moduleFormat = "cjs"`) + `datasource db` (postgresql); each model/enum lives in its own `*.model.prisma` file. Add new models as separate `<name>.model.prisma` files, not in `schema.prisma`.
- Client output: `prisma/generated/` (gitignored). Import client types from `../../prisma/generated/prisma/client.js` and enums from `../../prisma/generated/prisma/enums.js` (adjust the relative path).
- Prisma 7 generates database enums in `enums.ts`; import generated values (`Role.ADMIN`, `AuthProvider.EMAIL_PASSWORD`, `ProductStatus.ACTIVE`, `CardBrand.VISA`, ...) instead of redefining enums or repeating string literals.
- Use generated enum values in Prisma writes, filters, JWT payload contracts, and DTO validation/OpenAPI metadata.
- Never edit files under `prisma/generated`; update the schema and rerun `npx prisma generate`.
- After schema changes: `npx prisma migrate dev` then `npx prisma generate`.
- Keep application interfaces and types when they describe a transport or runtime contract that is not a direct Prisma model shape (for example `JwtPayload`, `AuthenticatedUser`, `BaseResponse`, and query filter types).
- Before adding an `interface`, `type`, or `enum`, check whether Prisma already generates the needed model, payload, enum, or input type. Do not create wrapper types that only duplicate generated Prisma types without adding domain meaning.
- Prisma query types should prefer generated `Prisma.*` types and `satisfies` for query fragments. See the local `prisma-client-api` skill for CRUD, filtering, relations, and transaction patterns.

## TypeScript

- `module: "nodenext"`, `moduleResolution: "nodenext"` — use `.js` extensions in relative imports
- `noImplicitAny: false`, `strictNullChecks: true`
- `emitDecoratorMetadata: true` + `experimentalDecorators: true`
- DTO fields use `!` (definite assignment) or initialized defaults; optional fields use `?:`

## Linting

- ESLint flat config (`eslint.config.mjs`) with `typescript-eslint` type-checked rules
- `@typescript-eslint/no-explicit-any: off`
- `@typescript-eslint/no-floating-promises: warn`
- `@typescript-eslint/no-unsafe-argument: warn`
- Prettier integrated via `eslint-plugin-prettier` (`.prettierrc`: `singleQuote: true`, `trailingComma: "all"`)

## Testing

- Unit tests: `*.spec.ts` files in `src/`, Jest rootDir is `src`
- E2e tests: `*.e2e-spec.ts` in `test/`, separate `jest-e2e.json` config
- Framework: Jest + ts-jest

## Environment

- Copy `.env.example` to `.env`
- Required: `DB_HOST` (PostgreSQL connection string), `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
- Optional: `PORT`, `JWT_ACCESS_EXP`, `JWT_REFRESH_EXP`, `ENVIRONMENT` (`DEV`/`PROD`)
- **NEVER read `.env`** — only read `.env.example` for variable reference
