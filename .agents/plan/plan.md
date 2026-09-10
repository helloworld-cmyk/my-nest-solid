# Plan tổng — Dựng backend để Flutter bỏ mock dần

> Chi tiết tách catalog xem `.agents/plan/plan_catalog.md` (v3 — đã duyệt 10/09/2026, là source of truth cho mọi route catalog/product/review/wishlist; file này chỉ tóm tắt trạng thái + roadmap).
> Quyết định giữ `jwt-token` guard/strategy (không xoá theo D6 của plan_catalog).

## 1. Hiện trạng backend

`AppModule` hiện import: `PrismaModule` (global), `AuthModule`, `ProfileModule`, `CategoryModule`, `PaymentModule`, `AddressModule`.

| Module | Routes | Guard | Trạng thái |
|---|---|---|---|
| `auth` | `POST /auth/login`, `POST /auth/register`, `POST /auth/refresh-token` | public | ✅ xong |
| `profile` | `GET /profile` | `JwtAuthGuard` | 🟡 1 phần — thiếu `PATCH /users/me`, đổi mật khẩu, upload avatar |
| `category` | `GET /categories` (public), `POST /categories` (admin) | — / `JwtAdminGuard` | ✅ xong — thay thế `catalog/` cũ đã xoá (D1, D4, D5) |
| `address` | `GET/POST /address`, `PATCH/DELETE /address/:id`, `PATCH /address/:id/default` | `JwtAuthGuard` | ✅ xong |
| `payment` | `GET/POST /payment`, `PATCH/DELETE /payment/:id`, `PATCH /payment/:id/default` | `JwtAuthGuard` | ✅ xong |
| `product` / `review` / `wishlist` / `cart` / `coupon` / `order` | — | — | ⬜ chưa có module (mới chỉ có repository cho product/review/wishlist) |

Hạ tầng dùng chung (đã xong):
- `PrismaModule` `@Global()` export `PrismaService` (`src/prisma/`) — feature modules KHÔNG tự provide `PrismaService` nữa (D7).
- `PaginationQueryDto` (`page`=1, `limit`=20, `limit` ≤ 100) + `PaginationMetaDto` (`page/limit/total/totalPages`) trong `src/dto/pagination.dto.ts` (D8).
- Envelope `BaseResponse { code, data, message }` (`ResponseInterceptor` global) + `ValidationPipe { whitelist, transform }` global (`main.ts`).
- 3 guards trong `auth/`: `JwtAuthGuard` (`jwt` — verify + load user từ DB, trả `AuthenticatedUser`), `JwtAdminGuard` (`jwt-admin` — verify role ADMIN), `JwtTokenGuard` (`jwt-token` — chỉ decode payload, đang giữ lại nhưng không endpoint nào dùng).

Repositories (`src/repositories/`, 9 file — giữ nguyên, không thêm): `user`, `user-address`, `payment-card`, `category`, `product` (đủ query public catalog: `buildWhere`, `resolveOrderBy`, `findPaginated`, `findBySlug/ById`, `findRelated`, `findHotDeals/NewArrivals/OnSale`, `findHomeFeed`, `findDistinctCategories`, `getPriceBounds`...), `product-image`, `product-variant`, `product-review` (`createAndRecalcRating` trong transaction), `wishlist`.

Schema (`prisma/schema/`, không migration trong scope này):
- Active (15 models): `User`, `Category`, `Product`, `ProductImage`, `ProductVariant`, `ProductReview`, `WishlistItem`, `Cart`, `CartItem`, `Order`, `OrderItem`, `Coupon`, `CouponRedemption`, `PaymentCard`, `UserAddress`.
- Enums: `AuthProvider`, `Role`, `ProductStatus`, `ProductImageType`, `CouponType`, `OrderStatus`, `PaymentMethod`, `PaymentStatus`, `CardBrand` (import từ `prisma/generated/prisma/enums.js`, không redefine).
- Comment (phase sau): `Device`, `UserDeviceSession`, `DeviceFcmToken` + enums đi kèm.

## 2. Hiện trạng Flutter (`solid/lib`)

- `auth` → đã gọi API thật (endpoints duy nhất trong `api_endpoint.dart`).
- `catalog`, `cart`, `checkout`, `wishlist`, `account` (profile/address/payment card/my order) → phần lớn đang dùng **mock data**. Thứ tự bỏ mock đi theo roadmap dưới đây.

## 3. Roadmap

- [x] **#0a Cốt lõi chung**: `PrismaModule` global + `PaginationQueryDto`/`PaginationMetaDto` — xong.
- [ ] **#0b Seed script** (category/product mẫu) — chưa làm. Mọi module catalog đều cần dữ liệu mẫu.
- [x] **#1a Category** (`GET /categories` public, `POST /categories` admin) — xong.
- [ ] **#1b Product** (`GET /products`, `/products/home|search|filters`, `/products/:slug`, `/products/:slug/related` — toàn public) — xem plan_catalog phase 3.
- [ ] **#1c Wishlist** (`GET/POST/DELETE /wishlist`, `JwtAuthGuard`) — xem plan_catalog phase 4. `WishlistRepository` đã sẵn.
- [ ] **#1d Review** (`GET /products/:productId/reviews` public + `POST` auth) — xem plan_catalog phase 5. `ProductReviewRepository.createAndRecalcRating` đã sẵn. Rule "chỉ review khi đã mua" để sau khi có Order.
- [x] **#2 Address** — xong, Flutter có thể bỏ mock.
- [x] **#3 PaymentCard** — xong, Flutter có thể bỏ mock.
- [ ] **#4 Profile** — thiếu `PATCH /users/me`, đổi mật khẩu, upload avatar (Flutter đã có `change_profile`, `crop_avatar`).
- [ ] **#5 Cart** (`GET /cart`, add/update/remove item, validate `variant.stock` + `isActive`) — tiền đề của checkout.
- [ ] **#6 Coupon** (`GET /coupons` active, `POST /coupons/validate`) — validate trước, redeem nằm trong Order.
- [ ] **#7 Order / Checkout** (`POST /orders` transaction: tạo Order + OrderItem snapshot, trừ stock, tăng `soldCount`, ghi `CouponRedemption`, xoá cart; `GET /orders`, `GET /orders/:id`, `PATCH /orders/:id/cancel`) — phức tạp nhất: `idempotencyKey`, `addressSnapshot`, `paymentMethod` COD/CARD.
- [ ] **#8 *(Phase sau)***: Device/Session/FCM notifications, cổng thanh toán thật, Admin CRUD products/coupons/dashboard, moderation review (schema `ProductReview` chưa có `isHidden/status` nên admin chỉ DELETE được).

## 4. Lý do sắp xếp thứ tự

1. **Theo dependency dữ liệu**: Category → Product → Wishlist → User-related (Profile/Address/Card) → Cart → Coupon → Order → Review ("đã mua" cần Order).
2. **Theo giá trị bỏ-mock trên Flutter**: catalog + wishlist cho hiệu ứng nhanh nhất; checkout là đích cuối.
3. **Tăng dần độ phức tạp**: module đầu chỉ READ public, module cuối là transaction nhiều bảng — ổn định pattern (DTO, repository, interceptor, test) trước khi vào chỗ khó.

## 5. Convention khi triển khai (chi tiết xem `AGENTS.md`)

- Module mới đặt trong `src/modules/<tên>/` (`controller/service/module/dto/request|response` như `address/`); DTO dùng chung trong `src/dto/`, repositories trong `src/repositories/`; import relative đuôi `.js` (`module: nodenext`).
- Không tự provide `PrismaService` trong feature module (dùng global); không tạo wrapper type/enum trùng với Prisma generated; `Decimal → number` trước khi trả JSON.
- Guards: read public để public; endpoint user dùng `JwtAuthGuard` method-level (lấy `req.user.id`); endpoint admin dùng `JwtAdminGuard`.
- Response trong envelope `BaseResponse`; mỗi list response tự khai báo `{ items: T[]; pagination: PaginationMetaDto }`.
- Sau mỗi module: `pnpm run lint` → `pnpm run test` → `pnpm run build` (lint baseline hiện có 2 errors pre-existing ở `auth.service.ts` + 1 warning ở `main.ts`).
- **KHÔNG đọc `.env`** — chỉ xem `.env.example`.
