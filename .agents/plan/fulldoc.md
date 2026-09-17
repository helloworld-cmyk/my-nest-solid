Tài liệu Onboarding Backend

Table of Contents

Lộ trình onboarding Backend

Mục tiêu: sau ~4 tuần có thể tự đọc hiểu code, chạy được dự án local, và làm được một endpoint hoàn chỉnh (controller + service + DTO + Swagger + test).

Stack cốt lõi: NestJS 10 · TypeScript · Prisma 6 · PostgreSQL · Redis · Docker · Kubernetes (kind) · GitLab CI.

0. Nền tảng bắt buộc (học trước / học song song)

Chủ đề

Cần nắm được gì

Ưu tiên

TypeScript

type/interface, generics, decorator, async/await, enum, Partial/Pick/Omit

⭐⭐⭐

Node.js

event loop, module, npm/pnpm, biến môi trường (.env)

⭐⭐⭐

HTTP & REST

method (GET/POST/PUT/PATCH/DELETE), status code, header, body, query/param

⭐⭐⭐

JSON & DTO

serialize/deserialize, validate dữ liệu vào

⭐⭐⭐

Git

branch, commit, merge/rebase, pull request, conflict

⭐⭐⭐

SQL cơ bản

SELECT/JOIN/WHERE/GROUP BY, index, khóa chính/khóa ngoại

⭐⭐

Docker

image vs container, docker compose up, port mapping, volume

⭐⭐

Dự án dùng pnpm. Cài Node ≥ 18 (khuyến nghị 20/22), Docker Desktop, và một client Postgres (DBeaver/TablePlus).

1. NestJS — trái tim của dự án (tuần 1–2)

Học theo đúng thứ tự này, mỗi mục mở code trong repo ra đối chiếu:

Module — cách Nest chia code thành module (*.module.ts). Xem src/auth/auth.module.ts.

Controller — định tuyến, nhận request. Đọc mẫu chuẩn: src/auth/auth.controller.ts.

Provider & Dependency Injection (DI) — service được inject vào controller thế nào. Xem src/auth/auth.service.ts.

DTO + class-validator — mọi body đều có DTO validate. Xem src/auth/dto/.

ValidationPipe — tự động biến DTO sai thành lỗi 400 (khai báo global ở src/main.ts).

Guard — bảo vệ route. Dự án dùng AuthGuard (JWT) + RolesGuard (@Roles(...)). Tìm trong src/auth/ và src/core/.

Interceptor / Exception filter — chuẩn hóa response & lỗi. Xem src/core/.

Config — @nestjs/config, đọc biến môi trường (ConfigService).

Swagger — @ApiProperty, @ApiTags, @ApiBearerAuth. Mọi endpoint phải có. UI ở http://localhost:3333/api.

📌 Bài tập: đọc kỹ 3 file auth.controller.ts / auth.service.ts / dto/, vẽ lại luồng "đăng nhập Google → trả access/refresh token".

2. Prisma + PostgreSQL (tuần 2)

Schema — src/database/schema.prisma. Lưu ý dự án có 2 loại model:

App-owned (được phép tạo migration): users, organizations, workspaces, user_sessions, oauth_accounts...

Platform tables (CHỈ ĐỌC, không tạo migration): Agent, Room, File, LlmEvent, CreditAccount... — introspect từ nền tảng TopAgent.

Migration — pnpm db:generate → prisma migrate dev (chỉ cho app-owned). Đọc kỹ mục "What to avoid" trong CLAUDE.md.

Prisma Client — cách query: findMany/findUnique/create/update, where, include, select, transaction.

Nhiều database — dự án nối tới 3 DB: topagent (app), topagent_chat (rooms, chat_messages), topagent_vectors (embeddings). Xem docs/topagent-databases.md.

Seed & tools — pnpm db:seed:root, pnpm db:view (Prisma Studio).

📌 Bài tập: dùng Prisma Studio xem bảng users, organizations, organization_members; viết thử một query đọc danh sách user của 1 org.

⚠️ Quy tắc vàng: không bao giờ sửa/tạo migration cho platform tables. Đọc, không ghi.

3. Xác thực & phân quyền (tuần 2–3)

JWT — cặp access token + refresh token, cách ký/verify (@nestjs/jwt, thư viện jose).

Google login — Google ID token → JWT nội bộ (google-auth-library).

SSO OIDC — dự án tích hợp SSO cơ quan nhà nước (HanoiWork, NHNN) theo chuẩn OpenID Connect + PKCE. Xem src/auth/hanoi-sso.service.ts, src/auth/nhnn-sso.service.ts.

RBAC — enum OrganizationRole (SUPER_ADMIN | ADMIN | MEMBER), @Roles(...) + RolesGuard; cờ User.isRoot.

Bảo mật password — hash bằng argon2.

📌 Khái niệm cần hiểu: access token vs refresh token khác nhau chỗ nào; guard chặn request chưa đăng nhập ra sao.

4. Các thành phần hạ tầng dùng trong dự án (tuần 3)

Công nghệ

Dùng để làm gì trong repo

File/đầu mối

Redis (cache-manager)

cache, lưu session/tạm

cấu hình module cache

MinIO (minio)

lưu file (S3-compatible)

src/files/

Kafka (kafkajs)

phát sự kiện index file (decouple file-service)

src/files/

i18n (nestjs-i18n)

đa ngôn ngữ lỗi (en/vi)

src/i18n/, errors.json

Logging (nestjs-pino)

log có cấu trúc

cấu hình ở main.ts

Mail (nodemailer)

gửi OTP/email

trong src/auth/

Schedule (@nestjs/schedule)

cron job

các service có @Cron

Helmet

HTTP security headers

main.ts

📌 Không cần thành thạo hết ngay — hiểu "cái nào giải quyết việc gì" trước, đào sâu khi chạm vào task cụ thể.

5. Cấu trúc dự án — bản đồ module

Mỗi thư mục dưới src/ là một domain. Đọc lướt để biết dự án có gì:

auth/ — đăng nhập, JWT, Google/SSO, OTP, đổi mật khẩu (đọc kỹ nhất — đây là module mẫu)

users/, organizations/, workspaces/ — người dùng & tổ chức (app-owned)

agents/, rooms/, chat/ — AI agent & hội thoại (đọc từ platform DB)

files/, folder-policies/ — quản lý file (MinIO + Kafka)

workflows/ — luồng tự động (nhiều controller con)

tools/, plugins/, models/, llm-budgets/ — công cụ AI, model, ngân sách LLM

sync/, google-integration/ — đồng bộ Google Drive

avatar/, anonymous-session/ — API Avatar & phiên ẩn danh

settings/ — cấu hình người dùng/tổ chức

core/ — DTO lỗi dùng chung, guard, tiện ích

database/ — Prisma schema, migration, seed

Toàn dự án hiện có ~180 endpoint trong 26 controller — đừng cố học hết, nắm 3–4 module trước.

6. Chạy dự án local (làm sớm trong tuần 1)

docker compose --env-file .env up -d topagent-pg redis   # bật Postgres + Redis
pnpm install
pnpm run db:deploy        # apply migration
pnpm run db:seed:root     # tạo tài khoản ROOT
pnpm run start:dev        # chạy watch mode trên cổng 3333

Swagger UI: http://localhost:3333/api — thử gọi API ngay trên đó.

Đọc thêm: CLAUDE.md (mục "How to run") và local-db/README.md.

📌 Milestone tuần 1: chạy được server, đăng nhập được, gọi thử 1 API trên Swagger.

7. Quy ước & chất lượng code (xuyên suốt)

Conventional Commits: feat(auth): ..., fix(db): ... (Husky + commitlint tự kiểm tra).

Lint & format: pnpm lint, pnpm format; CI chạy lint:types (tsc --noEmit).

DTO cho mọi input & output để Swagger chính xác.

Lỗi: ném HTTP exception của Nest; document bằng @ApiXxxResponse.

Route mặc định public; thêm @UseGuards(AuthGuard) + @ApiBearerAuth('access-token') cho route cần đăng nhập.

8. Testing (tuần 3–4)

Unit test: .spec.ts đặt cạnh source, chạy pnpm test. Mẫu: src/auth/.spec.ts.

E2E test: trong test/, dùng supertest, cần .env.test + pnpm db:test:up. Chạy pnpm test:e2e.

Học: cách mock service, @nestjs/testing (Test.createTestingModule), assertion với Jest.

📌 Bài tập: viết 1 unit test nhỏ cho một hàm trong service.

9. DevOps / triển khai (tìm hiểu sau, không gấp)

Docker & docker-compose: Dockerfile, docker-compose.yaml.

CI/CD: GitLab CI — push nhánh dev → build + deploy lên môi trường dev (xem .gitlab-ci.yml).

Kubernetes (kind): dự án chạy trên k8s; apply migration qua script trên server. Xem docs/deploy.md.

Thực tập sinh chưa cần tự deploy prod. Hiểu "code lên dev như thế nào" là đủ.

10. Thứ tự đọc tài liệu trong repo (đọc theo đúng thứ tự này)

CLAUDE.md — tổng quan dự án, cách chạy, quy ước, những điều cấm.

src/main.ts — điểm khởi động, cấu hình global (prefix api/v1, Swagger, guard).

src/auth/ — module mẫu đầy đủ nhất (controller + service + DTO + test).

src/core/dto/error-response.dto.ts — hình dạng lỗi dùng chung.

src/database/schema.prisma — mô hình dữ liệu.

docs/topagent-databases.md — schema 3 DB nền tảng.

docs/deploy.md — cách triển khai.

11. Lộ trình 4 tuần (gợi ý)

Tuần

Mục tiêu

1

TypeScript + NestJS cơ bản (module/controller/service/DI); chạy được dự án local; gọi API trên Swagger.

2

DTO + validation + Swagger; Prisma + Postgres; đọc hiểu module auth.

3

Guard/Role/JWT; Redis/MinIO/i18n ở mức khái niệm; bắt đầu viết test.

4

Làm 1 task thật: thêm/sửa một endpoint hoàn chỉnh (controller + service + DTO + Swagger + unit test), tạo PR đúng chuẩn commit.

🎯 Sản phẩm cuối kỳ (Definition of Done): một Pull Request thêm 1 endpoint mới, có DTO validate, có Swagger, có ít nhất 1 unit test, pass lint + type-check, commit đúng Conventional Commits.

12. Nguồn học ngoài (miễn phí)

NestJS docs (chính thống): https://docs.nestjs.com — đọc phần "Overview" và "Techniques".

Prisma docs: https://www.prisma.io/docs — phần "Prisma Client" và "Migrate".

TypeScript Handbook: https://www.typescriptlang.org/docs/handbook/intro.html

HTTP & REST: MDN Web Docs.

Khi bí, đọc code có sẵn trong repo trước — 90% mẫu cần dùng đã có trong src/auth/.

<w:p><w:r><w:br w:type="page"/></w:r></w:p>

Bộ bài tập luyện tập Backend — Thực tập sinh (độc lập, không dùng source dự án)

Bạn chưa cần truy cập source của dự án. Bộ bài tập này hướng dẫn bạn tự xây một API luyện tập từ số 0, đúng công nghệ mà dự án đang dùng (NestJS · TypeScript · Prisma · PostgreSQL · JWT · Swagger · Jest · Docker).

Dự án luyện tập xuyên suốt: mini-notes-api — một API quản lý "Ghi chú" (Note) có đăng nhập. Mỗi phần dưới đây bồi thêm một lớp cho chính project này, nên cuối cùng bạn có một sản phẩm hoàn chỉnh để nộp.

Cách làm & nộp bài: mỗi phần tạo một nhánh git riêng (bai-1, bai-2...), commit theo chuẩn feat: ..., và ghi lại "Tiêu chí hoàn thành" đã đạt. Viết một file README.md mô tả cách chạy.

Bài 0 — TypeScript thuần (2–3 ngày)

Mục tiêu: chắc TypeScript trước khi vào framework. Làm trong 1 file .ts chạy bằng ts-node, không dùng thư viện ngoài.

Yêu cầu — viết các hàm sau (kèm type đầy đủ, không dùng any):

sum(nums: number[]): number — tính tổng.

groupBy<T>(items: T[], key: (x: T) => string): Record<string, T[]> — gom nhóm (dùng generic).

Định nghĩa interface User { id: number; name: string; role: 'admin' | 'member' } và hàm filterAdmins(users: User[]): User[].

type PublicUser = Omit<User, 'role'> — dùng utility type; viết hàm chuyển User -> PublicUser.

Một hàm delay(ms: number): Promise<void> và một hàm main() dùng async/await gọi nó.

Tiêu chí hoàn thành:

Không có any, tsc --noEmit không báo lỗi.

Dùng được generic, union type, và ít nhất 1 utility type (Omit/Pick/Partial).

Có async/await hoạt động đúng.
Soạn
Viết cho Hà Đức Duy

Bài 0 — TypeScript thuần (2–3 ngày)

Mục tiêu: chắc TypeScript trước khi vào framework. Làm trong 1 file .ts chạy bằng ts-node, không dùng thư viện ngoài.

Yêu cầu — viết các hàm sau (kèm type đầy đủ, không dùng any):

sum(nums: number[]): number — tính tổng.

groupBy<T>(items: T[], key: (x: T) => string): Record<string, T[]> — gom nhóm (dùng generic).

Định nghĩa interface User { id: number; name: string; role: 'admin' | 'member' } và hàm filterAdmins(users: User[]): User[].

type PublicUser = Omit<User, 'role'> — dùng utility type; viết hàm chuyển User -> PublicUser.

Một hàm delay(ms: number): Promise<void> và một hàm main() dùng async/await gọi nó.

Tiêu chí hoàn thành:

Không có any, tsc --noEmit không báo lỗi.

Dùng được generic, union type, và ít nhất 1 utility type (Omit/Pick/Partial).

Có async/await hoạt động đúng.

Bài 1 — HTTP & REST không cần framework (1–2 ngày)

Mục tiêu: hiểu request/response ở mức thấp trước khi có NestJS che đi.

Yêu cầu: dùng module http có sẵn của Node, dựng một server nhỏ:

GET /health → trả JSON { status: "ok" }, status code 200.

GET /notes → trả về mảng note lưu tạm trong RAM.

POST /notes → đọc body JSON, thêm note mới, trả 201 + note vừa tạo.

Trả 404 cho route không tồn tại.

Tiêu chí hoàn thành:

Test bằng Postman/curl, đúng status code cho từng trường hợp.

Giải thích được (viết vào README): khác nhau giữa 200/201/400/404, và body vs query vs param.

Bài 2 — NestJS căn bản: CRUD trong bộ nhớ (3–4 ngày)

Mục tiêu: nắm Module / Controller / Service / Dependency Injection.

Yêu cầu: khởi tạo project bằng Nest CLI (nest new mini-notes-api), tạo NotesModule với CRUD lưu trong mảng RAM (chưa cần DB):

GET /notes — danh sách.

GET /notes/:id — chi tiết, không thấy thì ném NotFoundException (404).

POST /notes — tạo mới.

PATCH /notes/:id — sửa.

DELETE /notes/:id — xóa.

Logic đặt trong NotesService, controller chỉ điều phối (inject service vào controller).

Tiêu chí hoàn thành:

Có notes.module.ts, notes.controller.ts, notes.service.ts tách bạch.

Service được inject vào controller (không new thủ công).

Trả đúng 404 khi id không tồn tại.

Bài 3 — DTO, Validation & Swagger (2–3 ngày)

Mục tiêu: chuẩn hóa dữ liệu vào/ra và tự sinh tài liệu API.

Yêu cầu:

Cài class-validator, class-transformer; bật ValidationPipe toàn cục ở main.ts.

Tạo CreateNoteDto và UpdateNoteDto: title (bắt buộc, 1–120 ký tự), content (chuỗi, tối đa 5000), tags (mảng string, tùy chọn).

Gửi dữ liệu sai (title rỗng) → phải nhận 400 với thông báo lỗi rõ ràng.

Cài @nestjs/swagger, thêm @ApiProperty cho DTO, @ApiTags('notes'); mở được Swagger UI ở /api.

Tiêu chí hoàn thành:

Body sai → 400 tự động (không tự viết if kiểm tra thủ công).

Swagger UI hiển thị đủ endpoint + schema DTO, thử gọi được ngay trên UI.

Bài 4 — Prisma + PostgreSQL bằng Docker (4–5 ngày)

Mục tiêu: đây là phần lõi giống hệt dự án thật.

Yêu cầu:

Viết docker-compose.yml chạy 1 Postgres (map cổng, có volume, có user/password/db). Bật bằng docker compose up -d.

Cài Prisma, tạo schema.prisma với 2 model: User (id, email unique, name) và Note (id, title, content, tags, authorId → quan hệ tới User, createdAt, updatedAt).

Tạo migration đầu tiên (prisma migrate dev), sinh Prisma Client.

Sửa NotesService để đọc/ghi vào Postgres qua Prisma thay cho mảng RAM.

GET /notes hỗ trợ ?authorId= để lọc, và phân trang ?page=&limit=.

Tiêu chí hoàn thành:

docker compose up lên được Postgres; migration chạy thành công.

Dùng Prisma Studio (npx prisma studio) xem được dữ liệu.

Quan hệ User–Note đúng; query có include/where; có phân trang.

Giải thích được (README): migration là gì, khác gì với db push.

Bài 5 — Xác thực JWT & phân quyền (4–5 ngày)

Mục tiêu: đúng mô hình auth của dự án (access/refresh token + guard + role).

Yêu cầu:

POST /auth/register — tạo user, hash mật khẩu bằng argon2 (không lưu plaintext).

POST /auth/login — đúng mật khẩu thì trả access token (hết hạn ngắn, ví dụ 15 phút) + refresh token (dài hơn).

POST /auth/refresh — đổi refresh token lấy access token mới.

Viết AuthGuard kiểm tra JWT; áp cho các route notes (chưa đăng nhập → 401).

Thêm trường role (admin | member); viết RolesGuard + decorator @Roles('admin'); chỉ admin được DELETE /notes/:id.

Người dùng chỉ sửa/xóa được note của chính mình (trừ admin).

Tiêu chí hoàn thành:

Mật khẩu được hash (kiểm tra trong DB không thấy plaintext).

Không có token → 401; sai role → 403.

Refresh token hoạt động; giải thích được khác biệt access vs refresh token.

Bài 6 — Nâng cao (chọn 2 trong 4) (3–4 ngày)

Chọn 2 mục để làm quen thêm các thành phần dự án dùng:

Redis cache — cache kết quả GET /notes bằng cache-manager + Redis (thêm service Redis vào docker-compose); tự invalidate khi có thay đổi.

Upload file — endpoint POST /notes/:id/attachment nhận file, lưu vào thư mục local (hoặc MinIO nếu muốn thử S3-compatible).

i18n — thông báo lỗi song ngữ vi/en bằng nestjs-i18n.

Cron job — dùng @nestjs/schedule chạy tác vụ định kỳ (ví dụ mỗi phút log số lượng note).

Tiêu chí hoàn thành:

Hoàn thành 2 mục, mô tả cách kiểm chứng trong README.

Bài 7 — Kiểm thử (Testing) (3 ngày)

Mục tiêu: viết được unit test và e2e test — kỹ năng bắt buộc khi vào dự án.

Yêu cầu:

Unit test (*.spec.ts) cho NotesService: mock Prisma, kiểm tra create, findOne (cả trường hợp not found), remove.

E2E test dùng supertest: đăng ký → đăng nhập → tạo note → lấy danh sách, kiểm tra status code & body.

Chạy npm test và npm run test:cov.

Tiêu chí hoàn thành:

Ít nhất 5 unit test pass; 1 luồng e2e pass.

Coverage cho NotesService ≥ 70%.

Bài 8 — Đóng gói & quy trình Git (2 ngày)

Mục tiêu: làm việc chuẩn như trong nhóm.

Yêu cầu:

Viết Dockerfile build app; docker compose up chạy được cả app + Postgres.

Cấu hình ESLint + Prettier; đảm bảo lint và tsc --noEmit sạch lỗi.

Cài Husky + commitlint; commit đúng chuẩn Conventional Commits (feat:, fix:, chore:...).

Viết README.md: mô tả API, cách chạy, biến môi trường.

Tạo một Pull Request (trên GitHub cá nhân) gộp toàn bộ.

Tiêu chí hoàn thành:

docker compose up chạy được toàn bộ hệ thống từ máy trắng.

Lint + type-check sạch; commit đúng chuẩn; có PR mô tả rõ ràng.

Sản phẩm cuối kỳ (Definition of Done)

Một repo mini-notes-api hoàn chỉnh gồm:

CRUD Note lưu Postgres qua Prisma, có phân trang & lọc.

Auth JWT (access + refresh), phân quyền theo role & theo chủ sở hữu.

DTO validate đầy đủ + Swagger UI.

Ít nhất 2 tính năng nâng cao (Bài 6).

Unit + e2e test pass, coverage service ≥ 70%.

Chạy được bằng docker compose up; lint sạch; commit chuẩn; có PR.

Đạt được sản phẩm này nghĩa là bạn đã thực hành đúng toàn bộ kỹ năng cốt lõi mà dự án ADT TopAgent yêu cầu, và sẵn sàng đọc hiểu + đóng góp vào source thật.

Bảng tra thời lượng gợi ý

Bài

Nội dung

Thời lượng

0

TypeScript thuần

2–3 ngày

1

HTTP/REST không framework

1–2 ngày

2

NestJS CRUD in-memory

3–4 ngày

3

DTO + Validation + Swagger

2–3 ngày

4

Prisma + PostgreSQL (Docker)

4–5 ngày

5

JWT Auth + phân quyền

4–5 ngày

6

Nâng cao (chọn 2)

3–4 ngày

7

Testing

3 ngày

8

Docker + Git workflow

2 ngày

Tổng: ~4–5 tuần. Ưu tiên làm chắc Bài 2→5 (đây là phần lõi giống dự án nhất).
Thêm trường role (admin | member); viết RolesGuard + decorator @Roles('admin'); chỉ admin được DELETE /notes/:id.

Người dùng chỉ sửa/xóa được note của chính mình (trừ admin).

Tiêu chí hoàn thành:

Mật khẩu được hash (kiểm tra trong DB không thấy plaintext).

Không có token → 401; sai role → 403.

Refresh token hoạt động; giải thích được khác biệt access vs refresh token.

Bài 6 — Nâng cao (chọn 2 trong 4) (3–4 ngày)

Chọn 2 mục để làm quen thêm các thành phần dự án dùng:

Redis cache — cache kết quả GET /notes bằng cache-manager + Redis (thêm service Redis vào docker-compose); tự invalidate khi có thay đổi.

Upload file — endpoint POST /notes/:id/attachment nhận file, lưu vào thư mục local (hoặc MinIO nếu muốn thử S3-compatible).

i18n — thông báo lỗi song ngữ vi/en bằng nestjs-i18n.

Cron job — dùng @nestjs/schedule chạy tác vụ định kỳ (ví dụ mỗi phút log số lượng note).

Tiêu chí hoàn thành:

Hoàn thành 2 mục, mô tả cách kiểm chứng trong README.

Bài 7 — Kiểm thử (Testing) (3 ngày)

Mục tiêu: viết được unit test và e2e test — kỹ năng bắt buộc khi vào dự án.

Yêu cầu:

Unit test (*.spec.ts) cho NotesService: mock Prisma, kiểm tra create, findOne (cả trường hợp not found), remove.

E2E test dùng supertest: đăng ký → đăng nhập → tạo note → lấy danh sách, kiểm tra status code & body.

Chạy npm test và npm run test:cov.

Tiêu chí hoàn thành:

Ít nhất 5 unit test pass; 1 luồng e2e pass.

Coverage cho NotesService ≥ 70%.

Bài 8 — Đóng gói & quy trình Git (2 ngày)

Mục tiêu: làm việc chuẩn như trong nhóm.

Yêu cầu:

Viết Dockerfile build app; docker compose up chạy được cả app + Postgres.

Cấu hình ESLint + Prettier; đảm bảo lint và tsc --noEmit sạch lỗi.

Cài Husky + commitlint; commit đúng chuẩn Conventional Commits (feat:, fix:, chore:...).

Viết README.md: mô tả API, cách chạy, biến môi trường.

Tạo một Pull Request (trên GitHub cá nhân) gộp toàn bộ.

Tiêu chí hoàn thành:

docker compose up chạy được toàn bộ hệ thống từ máy trắng.

Lint + type-check sạch; commit đúng chuẩn; có PR mô tả rõ ràng.

Sản phẩm cuối kỳ (Definition of Done)

Một repo mini-notes-api hoàn chỉnh gồm:

CRUD Note lưu Postgres qua Prisma, có phân trang & lọc.

Auth JWT (access + refresh), phân quyền theo role & theo chủ sở hữu.

DTO validate đầy đủ + Swagger UI.

Ít nhất 2 tính năng nâng cao (Bài 6).

Unit + e2e test pass, coverage service ≥ 70%.

Chạy được bằng docker compose up; lint sạch; commit chuẩn; có PR.

Đạt được sản phẩm này nghĩa là bạn đã thực hành đúng toàn bộ kỹ năng cốt lõi mà dự án ADT TopAgent yêu cầu, và sẵn sàng đọc hiểu + đóng góp vào source thật.

Bảng tra thời lượng gợi ý

Bài

Nội dung

Thời lượng

0

TypeScript thuần

2–3 ngày

1

HTTP/REST không framework

1–2 ngày

2

NestJS CRUD in-memory

3–4 ngày

3

DTO + Validation + Swagger

2–3 ngày

4

Prisma + PostgreSQL (Docker)

4–5 ngày

5

JWT Auth + phân quyền

4–5 ngày

6

Nâng cao (chọn 2)

3–4 ngày

7

Testing

3 ngày

8

Docker + Git workflow

2 ngày

Tổng: ~4–5 tuần. Ưu tiên làm chắc Bài 2→5 (đây là phần lõi giống dự án nhất).
Soạn
Viết cho Hà Đức Duy
