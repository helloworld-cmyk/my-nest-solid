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
- `pnpm run prepare` — install/refresh Git hooks (Husky). It runs automatically on `pnpm install`, but can be skipped **silently** → run it manually and verify (see "Git hooks (Husky)")
- `pnpm exec commitlint --from HEAD~10 --to HEAD --verbose` — audit the last 10 commit messages

## Verify order

`lint` → `test` → `build`

## Commits

- **Conventional Commits** are enforced by Husky + commitlint: `type(scope): subject` (e.g. `feat(auth): thêm đăng nhập Google`). Git hooks live in `.husky/` (`commit-msg` → `pnpm exec commitlint --edit "$1"`, `pre-commit` → `pnpm run lint`); rules live in `commitlint.config.mjs`.
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`. Header ≤ 100 chars; subject lowercase (no leading capital), no trailing `.`.
- Scopes (optional, warning-only): `auth`, `profile`, `category`, `product`, `payment`, `address`, `prisma`, `db`, `config`, `swagger`, `socket`, `docker`, `ci`, `deps`, `docs`, `repo`.
- Before committing, see the local `conventional-commit` skill (`.agents/skills/conventional-commit/SKILL.md`) for the type/scope tables, examples, and hook-troubleshooting steps. Do not use `--no-verify` for anything that will be pushed.

## Git hooks (Husky)

Hooks are not fully committed: `pnpm run prepare` generates `.husky/_/` (gitignored) and sets `core.hooksPath`. Run it **once per clone** and after editing any file in `.husky/`.

```bash
pnpm run prepare
git config core.hooksPath   # must print: .husky/_
ls -la .husky/_             # must list: h, commit-msg, pre-commit
```

`pnpm install` runs `prepare` automatically, but husky's installer can skip silently (husky prints a one-line message and still exits 0) when `ignore-scripts` is enabled, `HUSKY=0` is set, or `.git` is not in the current directory. **An empty `core.hooksPath` means no hook is running and `git commit` accepts anything** — that is the first thing to check when a bad commit message gets through.

- `.husky/commit-msg` → `pnpm exec commitlint --edit "$1"` — blocks non-conventional messages (rules in `commitlint.config.mjs`).
- `.husky/pre-commit` → `pnpm run lint` — ESLint + Prettier `--fix`; if it rewrites files, run `git add -u` and commit again.
- Never edit `.husky/_/*` (generated shims); edit `.husky/<hook>` instead.
- Bypass only for throwaway WIP (`git commit --no-verify` or `HUSKY=0 git commit`), never for anything that will be pushed.
- Test without committing: `echo "done" | pnpm exec commitlint` (must fail) / `echo "chore: test" | pnpm exec commitlint` (must pass).
- Audit history: `pnpm exec commitlint --from HEAD~10 --to HEAD --verbose`. Full troubleshooting: `.agents/skills/conventional-commit/references/husky-setup.md`.

## Architecture

- **NestJS v11** app, **pnpm** package manager, **Prisma v7** ORM (PostgreSQL via `@prisma/adapter-pg` driver adapter)
- Entry: `src/main.ts` → `src/app.module.ts`. `main.ts` registers global `ValidationPipe({ whitelist: true, transform: true })`, `HttpExceptionFilter`, `PrismaExceptionFilter`, `ResponseInterceptor`, and Swagger at `/api-docs` — do not re-register these per module.
- Feature modules live under `src/modules/`: `auth`, `profile`, `category`, `product`, `payment`, `address`. Each module has `*.controller.ts`, `*.service.ts`, `*.module.ts`, and `dto/request/` + `dto/response/`.
- Repositories live in `src/repositories/` (one `*.repository.ts` per Prisma model, kebab-case). Services inject repositories; repositories inject the global `PrismaService` — never use `PrismaService` directly in services or controllers.
- `PrismaModule` (`src/prisma/`) is `@Global()`. `PrismaService` extends `PrismaClient` with the `PrismaPg` adapter and connects/disconnects via lifecycle hooks.
- Shared cross-module DTOs live in `src/common/dto/` (currently `PaginationQueryDto`, `PaginationMetaDto`, `BaseRequestDto`); module-specific DTOs live in each module's `dto/`.
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

## Cart / Checkout invariants

- Every purchasable unit is a `ProductVariant`, never a bare `Product`. `Product` holds catalog info (name, base price); `stock` and `isActive` live only on `ProductVariant`.
- `AddCartItemDto` requires both `productId` and `variantId` — whenever `productId` is sent, `variantId` is mandatory and must belong to that `productId`.
- `CartService.addItem` / `updateItem` always validate `variant.isActive` and `variant.stock`; legacy cart rows without a variant are rejected with `BadRequestException('Cart item missing variant')`.
- `CartRepository.findItemByCartProductVariant` / `createItem` take `variantId: number` (never null); `CartItem.variantId` and `OrderItem.variantId` are `NOT NULL` in the schema (`OrderItem.variant` uses `onDelete: Restrict` — deactivate with `isActive: false` instead of hard-deleting an ordered variant).
- A sellable product must always have ≥1 variant. Postgres cannot enforce "at least one child" declaratively, so enforce it at write time: product seeds / future admin create-product must create the product plus its variants (a default variant with `colorHexCode: null, size: null` for items without options — the `@@unique([productId, colorHexCode, size])` allows exactly one per product) in a single transaction. Never activate (`status: ACTIVE`) a product with zero variants.
- `CartItemResponseDto.variantId` / `variant` are non-nullable, matching the `NOT NULL` columns; mapper and service assume the variant is always present.
- Future `Order`/checkout code must follow the same rule: read price override from the variant (fallback to product price), snapshot `colorHexCode`/`size` into `OrderItem`, and check/decrement `ProductVariant.stock` only — never `Product` stock (there is no such column).

## DTOs

- Request DTOs live in `dto/request/`, response DTOs in `dto/response/`; shared base DTOs in `src/common/dto/`.
- Every `@Body()` endpoint takes an envelope `<X>RequestDto extends BaseRequestDto<XDto>` (`src/common/dto/base-request.dto.js`): body is `{ metadata?: RequestMetadataDto, data: XDto }`. The wrapper class lives next to the original DTO in the same file and must re-declare `data` with `@ValidateNested() @Type(() => XDto)` — TypeScript generics are erased at runtime, so without a concrete class the nested DTO's validators never run and `whitelist: true` strips the payload.
- Controllers pass the whole envelope `dto` to the service; services destructure `const { data } = dto;` (add `metadata` only when a function actually uses it). Original DTOs, response shape, and repositories stay unchanged.
- `RequestMetadataDto` currently has only `lang` (`en|vi`, optional), consumed by the i18n `BodyLanguageResolver` (`body.metadata.lang` with fallback to legacy `body.lang`). Add more metadata fields only when there is a real need.
- Query DTOs that paginate extend `PaginationQueryDto` from `src/common/dto/pagination.dto.js`.
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
- Paginated reads use `$transaction([findMany, count])` plus the shared helpers in `src/utils/pagination/index.js`: `normalizePagination` (floor page/limit, default page 1 / limit 20, cap limit at 100, returns `skip`), `clampLimit` for non-paginated list caps (default max 20), and `buildPaginationMeta` for response `pagination` blocks. Never re-implement these rules locally.
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
- **NEVER read `.env`** — `.env.example` is the only env file an agent may read. Full rules: "Secrets & credentials" below.

## Secrets & credentials

- **Do not read credential/secret files on your own initiative.** Opening any file that holds a token, key, password, or connection string requires the user's explicit permission **for that file and that task**; a permission given once never carries over to the next request.
- Treat as credentials — never `cat`, `head`, `tail`, `less`, `cp`, `grep`, `git show`, or otherwise open — `.env` and `.env.*` (except `.env.example`), `*.pem`, `*.key`, `*.p12`, `*.pfx`, `*.jks`, keystores, `serviceAccount*.json` / any file referenced by `GOOGLE_APPLICATION_CREDENTIALS` (e.g. Firebase Admin SDK JSON), `~/.aws/*`, `~/.ssh/*`, `~/.netrc`, `~/.docker/config.json`, `~/.npmrc` / `.npmrc` auth tokens, `.pgpass`, CI/CD secret files, and anything `.gitignore` excludes for being secret.
- Read the example/template instead: `.env.example` is the **only** env file an agent may read. Other safe sources for variable names: `docker-compose.yml`, `README.md`, `prisma.config.ts`, and `ConfigService.get('<KEY>')` call sites under `src/`.
- If the template is missing or outdated, **ask the user to create/update `<name>.example` with placeholder values** (e.g. `JWT_ACCESS_SECRET=changeme`) and read that — never open the real file "just to check".
- If a real value is truly unavoidable (for example to debug a DB connection), name the variable and the reason in the request, then **wait for the user to paste it** — do not fetch it yourself.
- Never write real secrets into source, tests, fixtures, seeds, comments, Swagger examples, logs, error messages, or commit messages. Use placeholders (`test-secret`, `changeme`, `********`) and env indirection (`ConfigService` / `process.env`) — no hardcoded secrets.
- Never commit a secret file: verify `.gitignore` covers it before creating any file that holds a token.
- If a secret appears to have leaked (already committed, printed to output/log, or seen unexpectedly), **stop and tell the user** — do not rotate keys, rewrite git history, or "clean up" silently.
- When unsure whether something counts as a credential, treat it as one and ask first.

## Planning

- Khi lập kế hoạch, chỉ cần ngắn gọn: liệt kê file sẽ sửa/tạo + mục đích 1 dòng mỗi file, không viết plan dài dòng
