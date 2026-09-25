# Testing Learning Guide — NestJS + Jest + Supertest (cho codebase my-nest-solid)

> Mục tiêu tuần 3–4: đọc xong file này là tự viết được unit test (`*.spec.ts`) và e2e test (`*.e2e-spec.ts`) cho codebase hiện tại.
> Ngôn ngữ: TypeScript. Framework: Jest + ts-jest + `@nestjs/testing` + `supertest`.

---

## 0. Đối chiếu yêu cầu task vs hiện trạng repo (đọc trước để khỏi lạc)

| Yêu cầu trong task | Hiện trạng thực tế (đã kiểm chứng) |
|---|---|
| Unit test: `*.spec.ts` đặt cạnh source, chạy `pnpm test` | ✅ Đúng. `package.json:78-94`: `rootDir: src`, `testRegex: .*\.spec\.ts$`. Chạy `pnpm test` (hoặc `pnpm run test`) |
| Mẫu: `src/auth/*.spec.ts` | ⚠️ **Chưa có.** Hiện chỉ có đúng 1 mẫu: `src/app.controller.spec.ts`. Dùng nó làm mẫu tạm, hoặc copy ví dụ ở mục 4–5 bên dưới |
| E2E test: trong `test/`, dùng supertest | ✅ Đúng. Mẫu duy nhất: `test/app.e2e-spec.ts`. Config: `test/jest-e2e.json`, chạy `pnpm run test:e2e` |
| Cần `.env.test` + `pnpm db:test:up` | ⚠️ **Chưa có.** Repo hiện không có file `.env.test`, không có script `db:test:up` trong `package.json`, `docker-compose.yml` chỉ có 1 DB duy nhất (`DB_HOST`). Xem mục 7 để tự bổ sung |

Kết luận: học unit test trước (chạy được ngay, không cần DB). E2E cần setup thêm DB test (mục 7).

> ⚠️ Phát hiện khi kiểm chứng ngày 18/09/2026: `pnpm test` đang **đỏ ngay từ baseline** — `src/app.controller.spec.ts` fail với `Cannot find module './modules/auth/guard/jwt.guard.js'`. Nguyên nhân: repo dùng `module: nodenext` nên source import có đuôi `.js` (`jwt.guard.js`), nhưng config Jest trong `package.json` chưa có `moduleNameMapper` để map `.js` → `.ts`. Fix gợi ý (thêm vào block `"jest"` trong `package.json`): `"moduleNameMapper": { "^(\\.{1,2}/.*)\\.js$": "$1" }`. Chưa sửa code vì ngoài phạm vi file học này — nhưng mọi `*.spec.ts` mới đều sẽ gặp lỗi này cho tới khi config được fix.


---

## 1. Lệnh chạy test (copy-paste)

```bash
# Unit test — quét toàn bộ src/**/*.spec.ts
pnpm test
pnpm run test

# Chạy 1 file cụ thể (nhanh khi học)
pnpm test category.service.spec
pnpm test auth.service.spec

# Watch mode (sửa code là chạy lại)
pnpm run test:watch

# Coverage (xem dòng nào chưa được test)
pnpm run test:cov

# E2E — quét test/*.e2e-spec.ts theo test/jest-e2e.json
pnpm run test:e2e
```

Lưu ý về verify order của repo (`AGENTS.md`): `lint` → `test` → `build`.

```bash
pnpm run lint && pnpm run test && pnpm run build
```

---

## 2. Tư duy testing trong codebase này (quan trọng nhất)

```
Controller (mỏng, chỉ delegate) → Service (business logic, throw HTTP exception)
→ Repository (query Prisma, select/include) → PrismaService → PostgreSQL
```

Quy tắc test suy ra từ kiến trúc:

1. **Test Service = mock Repository.** Service không bao giờ gọi DB thật trong unit test. Ví dụ `CategoryService` chỉ phụ thuộc `CategoryRepository` → mock 2 hàm `findAllActive`, `findBySlug`, `create`.
2. **Test Controller = mock Service.** Controller mỏng, chỉ kiểm tra "có gọi đúng service với đúng tham số không".
3. **Không test Repository bằng unit test** (nó chỉ là wrapper Prisma). Muốn kiểm tra query thật → viết e2e.
4. **Service trả về payload `data` thuần**, không wrap `{ code, message, data }` — interceptor lo việc đó (`src/interceptor/interceptor.ts`). Nên assertion trong test so sánh object thuần.
5. **Service throw Nest HTTP exception với message tiếng Anh ngắn gọn** (`NotFoundException`, `ConflictException`, `UnauthorizedException`, `BadRequestException`) — test bằng `rejects.toThrow(...)`.
6. **Import tương đối phải có đuôi `.js`** (`module: nodenext`). Trong file spec cũng vậy:
   `import { CategoryService } from './category.service.js';`

---

## 3. Jest tối thiểu cần biết (đủ dùng cho 90% test)

```ts
describe('Tên nhóm test (thường là tên class)', () => {
  it('mô tả hành vi mong đợi', () => {
    // AAA: Arrange – Act – Assert
    const input = 1;          // Arrange
    const result = input + 1; // Act
    expect(result).toBe(2);   // Assert
  });
});
```

| API | Dùng khi nào | Ví dụ |
|---|---|---|
| `describe` / `it` | Gom nhóm / 1 case. `it` = `test` | `it('should throw 409 when slug exists', ...)` |
| `beforeEach` | Dựng module + reset mock trước mỗi case | Xem mọi ví dụ mục 4–5 |
| `expect(x).toBe(y)` | So sánh primitive (`===`) | `expect(name).toBe('shoes')` |
| `expect(x).toEqual(y)` | So sánh object/array theo giá trị (deep equal) | `expect(result).toEqual([{ id: 1 }])` |
| `expect(x).toMatchObject(y)` | Object chứa ít nhất các field này | `expect(user).toMatchObject({ email: 'a@b.c' })` |
| `expect(fn).toHaveBeenCalledWith(...)` | Kiểm tra mock được gọi với args nào | `expect(repo.create).toHaveBeenCalledWith({...})` |
| `await expect(promise).rejects.toThrow(X)` | Test async throw exception | `await expect(svc.login(dto)).rejects.toThrow(UnauthorizedException)` |
| `await expect(promise).rejects.toThrow('msg')` | Kiểm tra luôn message | `...rejects.toThrow('Invalid credentials')` |

Mock function:

```ts
const mockFn = jest.fn();                       // mock rỗng
mockFn.mockResolvedValue({ id: 1 });            // async trả về giá trị
mockFn.mockRejectedValue(new Error('fail'));    // async throw
mockFn.mockReturnValue('sync-value');           // sync trả về
expect(mockFn).toHaveBeenCalledTimes(1);        // đếm số lần gọi
jest.clearAllMocks();                           // xóa lịch sử gọi (đặt trong beforeEach)
```

---

## 4. Unit test Service — pattern chuẩn (`Test.createTestingModule`)

Đây là pattern dùng cho **mọi service** trong repo. Học thuộc khung này:

```ts
import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { CategoryService } from './category.service.js';
import { CategoryRepository } from '../../repositories/category.repository.js';

describe('CategoryService', () => {
  let service: CategoryService;
  // Gõ mock theo Repository để được gợi ý đúng tên hàm
  let repo: jest.Mocked<CategoryRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService, // class thật cần test
        {
          provide: CategoryRepository, // dependency -> thay bằng mock
          useValue: {
            findAllActive: jest.fn(),
            findBySlug: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
    repo = module.get(CategoryRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
```

Giải thích từng dòng cho người mới:

- `Test.createTestingModule({ providers: [...] })` — dựng một Nest DI container mini chỉ cho test, không boot cả app, không cần DB.
- `provide: CategoryRepository, useValue: {...}` — "khi `CategoryService` xin `CategoryRepository`, đừng new thật, hãy đưa object mock này". Đây chính là **cách mock service/dependency** mà task yêu cầu.
- `module.get(X)` — lấy instance ra để gọi hàm / kiểm tra mock.
- `jest.Mocked<CategoryRepository>` — ép kiểu để TypeScript hiểu `repo.findBySlug` là `jest.fn()`, gọi được `mockResolvedValue`.

### Ví dụ 4a. Copy-paste được: `src/modules/category/category.service.spec.ts`

Test đúng logic thật của `CategoryService` (`findBySlug` → 409, `create` → mapper):

```ts
import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { CategoryService } from './category.service.js';
import { CategoryRepository } from '../../repositories/category.repository.js';

describe('CategoryService', () => {
  let service: CategoryService;
  let repo: jest.Mocked<CategoryRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        {
          provide: CategoryRepository,
          useValue: {
            findAllActive: jest.fn(),
            findBySlug: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
    repo = module.get(CategoryRepository);
  });

  describe('getCategories', () => {
    it('should return mapped list', async () => {
      // Arrange: giả lập DB trả về 1 row
      repo.findAllActive.mockResolvedValue([
        { id: 1, name: 'Shoes', slug: 'shoes', imagePath: null },
      ]);

      // Act
      const result = await service.getCategories();

      // Assert
      expect(result).toEqual([
        { id: 1, name: 'Shoes', slug: 'shoes', imagePath: null },
      ]);
      expect(repo.findAllActive).toHaveBeenCalledTimes(1);
    });
  });

  describe('createCategory', () => {
    it('should throw 409 when slug already exists', async () => {
      repo.findBySlug.mockResolvedValue({ id: 99 }); // slug đã tồn tại

      await expect(
        service.createCategory({ name: 'Shoes', slug: 'shoes' } as any),
      ).rejects.toThrow(ConflictException);

      await expect(
        service.createCategory({ name: 'Shoes', slug: 'shoes' } as any),
      ).rejects.toThrow("Category with slug 'shoes' already exists");

      expect(repo.create).not.toHaveBeenCalled(); // không được ghi DB
    });

    it('should create with isActive default true', async () => {
      repo.findBySlug.mockResolvedValue(null); // slug chưa tồn tại
      repo.create.mockResolvedValue({
        id: 1,
        name: 'Shoes',
        slug: 'shoes',
        imagePath: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      await service.createCategory({ name: 'Shoes', slug: 'shoes' } as any);

      // Assert quan trọng nhất: service truyền đúng payload xuống repo
      expect(repo.create).toHaveBeenCalledWith({
        name: 'Shoes',
        slug: 'shoes',
        imagePath: undefined,
        isActive: true, // dto.isActive ?? true
      });
    });
  });
});
```

Chạy: `pnpm test category.service.spec`

### Ví dụ 4b. Copy-paste được: `src/modules/auth/auth.service.spec.ts`

`AuthService` có 3 dependencies (`UserRepository`, `JwtService`, `ConfigService`) + dùng `argon2`. Pattern: mock cả 3, mock luôn `argon2`.

```ts
import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service.js';
import { UserRepository } from '../../repositories/user.repository.js';
import { verify } from 'argon2';

// Mock module argon2 (native, không gọi thật trong test)
jest.mock('argon2', () => ({
  hash: jest.fn(),
  verify: jest.fn(),
}));
const mockVerify = verify as jest.Mock;

describe('AuthService', () => {
  let service: AuthService;
  let userRepo: jest.Mocked<UserRepository>;
  let jwt: jest.Mocked<JwtService>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserRepository,
          useValue: { findByEmail: jest.fn(), emailExists: jest.fn(), create: jest.fn(), findById: jest.fn() },
        },
        {
          provide: JwtService,
          useValue: { sign: jest.fn(), verify: jest.fn() },
        },
        {
          provide: ConfigService,
          // Giả lập config: get('JWT_ACCESS_SECRET') -> 'test-secret', ...
          useValue: { get: jest.fn((key: string, fallback?: any) => fallback ?? 'test-secret') },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepo = module.get(UserRepository);
    jwt = module.get(JwtService);
  });

  describe('login', () => {
    it('should throw 401 when email not found', async () => {
      userRepo.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'a@b.c', password: 'x' } as any),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw 401 when password is wrong', async () => {
      userRepo.findByEmail.mockResolvedValue({
        id: 'u1', email: 'a@b.c', passwordHash: 'hashed', role: 'USER',
      } as any);
      mockVerify.mockResolvedValue(false);

      await expect(
        service.login({ email: 'a@b.c', password: 'wrong' } as any),
      ).rejects.toThrow('Invalid credentials');
    });

    it('should return tokens when credentials are valid', async () => {
      userRepo.findByEmail.mockResolvedValue({
        id: 'u1', email: 'a@b.c', passwordHash: 'hashed', role: 'USER',
      } as any);
      mockVerify.mockResolvedValue(true);
      jwt.sign.mockReturnValueOnce('access').mockReturnValueOnce('refresh');

      const result = await service.login({ email: 'a@b.c', password: 'ok' } as any);

      expect(result).toMatchObject({ accessToken: 'access', refreshToken: 'refresh' });
      expect(jwt.sign).toHaveBeenCalledTimes(2);
    });
  });

  describe('register', () => {
    it('should throw 409 when email exists', async () => {
      userRepo.emailExists.mockResolvedValue(true);

      await expect(
        service.register({ email: 'a@b.c', password: '123456' } as any),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('refreshToken', () => {
    it('should throw 401 when jwt.verify fails', async () => {
      jwt.verify.mockImplementation(() => { throw new Error('expired'); });

      await expect(
        service.refreshToken({ refreshToken: 'bad' } as any),
      ).rejects.toThrow('Invalid refresh token');
    });
  });
});
```

Chạy: `pnpm test auth.service.spec`

> Mẹo: `argon2` là native module, build chậm — luôn `jest.mock('argon2')` trong unit test, không bao giờ hash thật.

---

## 5. Unit test Controller — mock Service

Controller trong repo là lớp mỏng (delegate), nên test chỉ cần 1 việc: **controller có gọi service với đúng args không**.

Mẫu có sẵn `src/app.controller.spec.ts` chính là pattern này (Controller thật + Service thật đơn giản). Với controller có dependency, mock service:

```ts
// src/modules/category/category.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { CategoryController } from './category.controller.js';
import { CategoryService } from './category.service.js';

describe('CategoryController', () => {
  let controller: CategoryController;
  let service: jest.Mocked<CategoryService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [
        {
          provide: CategoryService,
          useValue: { getCategories: jest.fn(), createCategory: jest.fn() },
        },
      ],
    })
      // Controller đang gắn JwtAuthGuard — bypass guard trong unit test:
      .overrideGuard(require('../auth/guard/jwt.guard.js').JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<CategoryController>(CategoryController);
    service = module.get(CategoryService);
  });

  it('should delegate to service', async () => {
    service.getCategories.mockResolvedValue([{ id: 1 } as any]);

    const result = await controller.getCategories();

    expect(result).toEqual([{ id: 1 }]);
    expect(service.getCategories).toHaveBeenCalledTimes(1);
  });
});
```

3 kỹ thuật cần nhớ:

| Kỹ thuật | Cú pháp | Khi dùng |
|---|---|---|
| Mock provider | `{ provide: X, useValue: { fn: jest.fn() } }` | Mock Service trong test Controller; mock Repository trong test Service |
| Bypass guard | `.overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true })` | Mọi controller có `@UseGuards(...)` — unit test không cần JWT thật |
| Mock giá trị động | `{ provide: X, useFactory: () => ({...}) }` | Khi mock cần đọc env / tạo mới mỗi test |

---

## 6. E2E test — supertest (test toàn bộ request thật)

Mẫu có sẵn `test/app.e2e-spec.ts`:

```ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule], // boot CẢ app thật (khác unit test chỉ boot 1 provider)
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer()).get('/').expect(200).expect('Hello World!');
  });
});
```

Khác biệt unit vs e2e:

- Unit: `Test.createTestingModule({ providers/controllers })` + `module.get()` — gọi hàm trực tiếp, không HTTP.
- E2E: `imports: [AppModule]` + `createNestApplication()` + `request(server).get/post(...)` — đi qua ValidationPipe, Guard, Filter, Interceptor thật.

### Ví dụ e2e thực tế cho codebase (categories — endpoint GET cần JWT)

```ts
// test/category.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';

describe('Categories (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [require('../src/app.module.js').AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    // main.ts đăng ký global pipe/filter/interceptor — e2e phải đăng ký lại thủ công:
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    // Lấy token thật bằng endpoint register/login (seed DB test trước — xem mục 7)
    await request(app.getHttpServer()).post('/auth/register').send({
      email: 'e2e@test.com', password: '12345678',
      firstName: 'E2E', lastName: 'Test', phone: '0900000000',
    });
    const login = await request(app.getHttpServer()).post('/auth/login').send({
      email: 'e2e@test.com', password: '12345678',
    });
    accessToken = login.body.data.accessToken; // nhớ ResponseInterceptor wrap { code, message, data }
  });

  afterAll(async () => { await app.close(); });

  it('GET /categories → 401 without token', () => {
    return request(app.getHttpServer()).get('/categories').expect(401);
  });

  it('GET /categories → 200 with token', async () => {
    const res = await request(app.getHttpServer())
      .get('/categories')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body).toMatchObject({ code: 200, message: 'Success' });
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
```

> Bẫy hay gặp: response bị wrap `{ code, message, data }` bởi `ResponseInterceptor` → assertion phải đọc `res.body.data`, không phải `res.body` trực tiếp.

---

## 7. Phần còn thiếu: `.env.test` + `pnpm db:test:up` (tự bổ sung để chạy e2e với DB thật)

E2E boot cả `AppModule` → `PrismaService` kết nối `DB_HOST` thật. Chạy e2e vào DB dev sẽ xóa/bẩn dữ liệu. Quy trình chuẩn:

**Bước 1 — thêm script test DB vào `package.json`:**

```json
{
  "scripts": {
    "db:test:up": "docker run -d --rm --name my-nest-test-db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=123456 -e POSTGRES_DB=mydb_test -p 5433:5432 postgres:17",
    "db:test:down": "docker stop my-nest-test-db",
    "test:e2e": "jest --config ./test/jest-e2e.json"
  }
}
```

**Bước 2 — tạo `.env.test`:**

```bash
# .env.test (DB test chạy port 5433, tách khỏi DB dev 5432)
DB_HOST=postgresql://postgres:123456@localhost:5433/mydb_test
JWT_ACCESS_SECRET=test-access-secret
JWT_REFRESH_SECRET=test-refresh-secret
JWT_ACCESS_EXP=5m
JWT_REFRESH_EXP=7d
```

**Bước 3 — chạy e2e:**

```bash
pnpm db:test:up
# migrate schema sang DB test (Prisma 7 dùng DB_HOST từ .env → override tạm):
DB_HOST=postgresql://postgres:123456@localhost:5433/mydb_test npx prisma migrate deploy
# chạy e2e với env test (Linux/macOS):
DB_HOST=postgresql://postgres:123456@localhost:5433/mydb_test pnpm run test:e2e
pnpm db:test:down
```

Quy tắc vàng: **không bao giờ chạy e2e vào DB dev**. Mỗi lần e2e nên reset dữ liệu (truncate tables hoặc migrate fresh) trong `beforeAll`/`afterEach`.

---

## 8. Lộ trình luyện tập (2 tuần)

- [ ] **Ngày 1:** chạy `pnpm test` cho qua. Đọc `src/app.controller.spec.ts`, gõ lại bằng tay để hiểu `createTestingModule`.
- [ ] **Ngày 2:** tạo `src/modules/category/category.service.spec.ts` từ ví dụ 4a, chạy `pnpm test category.service.spec`, thử sửa `isActive: true` → `false` xem test đỏ.
- [ ] **Ngày 3:** tạo `src/modules/auth/auth.service.spec.ts` từ ví dụ 4b. Hiểu `jest.mock('argon2')`, mock `JwtService` + `ConfigService`.
- [ ] **Ngày 4:** tạo `category.controller.spec.ts` (mục 5). Hiểu `overrideGuard`.
- [ ] **Ngày 5:** chạy `pnpm run test:cov`, tìm service chưa có test (cart, product, wishlist...), viết thêm 1 file spec cho module mình phụ trách.
- [ ] **Tuần 2:** setup `.env.test` + `db:test:up` (mục 7), chạy `pnpm run test:e2e`, viết `test/category.e2e-spec.ts`.

---

## 9. Troubleshooting

| Lỗi | Nguyên nhân | Cách sửa |
|---|---|---|
| `Cannot find module './x.js'` (đặc biệt `jwt.guard.js` ở baseline) | Thiếu đuôi `.js` trong import, **hoặc** Jest chưa map `.js` → `.ts` | Thêm `.js`: `from './category.service.js'`; nếu vẫn lỗi, thêm `"moduleNameMapper": { "^([.]{1,2}/.*)[.]js$": "$1" }` vào block `"jest"` trong `package.json` |
| `Nest can't resolve dependencies of CategoryService` | Quên mock Repository trong `providers` | Thêm `{ provide: CategoryRepository, useValue: {...} }` |
| `401 trong unit test controller` | Guard chặn | `.overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true })` |
| `argon2 build fail / test chậm` | Gọi argon2 thật | `jest.mock('argon2', ...)` ở đầu file spec |
| E2E ghi đè DB dev | Dùng nhầm `DB_HOST` | Dùng `.env.test` + DB port riêng (mục 7) |
| `res.body` không có field mong đợi | Quên ResponseInterceptor wrap | Đọc `res.body.data` |
| Test pass lẻ, fail khi chạy chung | Mock rò rỉ giữa các case | Thêm `jest.clearAllMocks()` trong `beforeEach` |

---

## 10. Cheat sheet dán tường

```ts
// Khung unit test Service (học thuộc)
const module = await Test.createTestingModule({
  providers: [ServiceThat, { provide: DepRepo, useValue: { method: jest.fn() } }],
}).compile();

// Async success / fail
repo.method.mockResolvedValue(value);
await expect(service.call()).rejects.toThrow(ExceptionClass);

// Controller: mock service + bypass guard
.overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true })

// E2E: boot app + gọi HTTP
app = moduleFixture.createNestApplication(); await app.init();
request(app.getHttpServer()).get('/path').expect(200);
```
