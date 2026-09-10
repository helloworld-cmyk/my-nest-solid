# Catalog Refactor — Tách module (plan v3)

> **Trạng thái: ⏳ CHỜ DUYỆT — chưa code.**
> - v1 gom mọi thứ vào một module `catalog` → quá lớn.
> - v2 giữ prefix `/catalog/*` + dồn admin vào một module `admin` → vẫn trái quyết định tách nhỏ.
> - **v3 (bản này)**: tách thành **4 modules** theo domain, route **REST chuẩn**, xoá `catalog/` cũ. Admin/cart/coupon/order là **phase sau, chưa duyệt** (mục 8).
> - Mọi response nằm trong envelope `BaseResponse { code, data, message }` (`src/interceptor/interceptor.ts`, global trong `main.ts`) → JSON shape bên dưới là phần `data`.
> - Verify sau mỗi phase: `pnpm run lint` → `pnpm run test` → `pnpm run build`.

**Quyết định đã duyệt (10/09/2026):** tách 4 modules (category riêng, product riêng, review riêng, wishlist riêng; variant/image embed trong product detail) + đổi sang REST chuẩn (`/categories`, `/products`...). Flutter phía catalog đang mock (`api_endpoint.dart` hiện chỉ có auth) → đổi path an toàn.

---

## 0. Quyết định chính

| # | Quyết định | Lý do |
|---|-----------|-------|
| D1 | Xoá `src/modules/catalog/`; tạo 4 modules: `category`, `product`, `review`, `wishlist` | `catalog/` hiện tại chỉ làm Category nhưng khai 8 providers (chỉ dùng 1) — nhồi thêm Product/Review/Wishlist vào sẽ thành god-module |
| D2 | Route REST chuẩn số nhiều, public read không guard: `GET /categories`, `GET /products`, `GET /products/:slug` (+ tiện ích `home/search/filters/related` trong product module) | Catalog read phải public cho listing trước login; route cũ `GET /catalog/categories` đang gắn `JwtTokenGuard` là sai spec |
| D3 | `review/` module riêng, route nested: `GET /products/:productId/reviews` (public) + `POST /products/:productId/reviews` (`JwtAuthGuard` method-level) | Domain riêng: validate product ACTIVE + chống double review + recompute rating trong transaction (`createAndRecalcRating` đã có trong repo) |
| D4 | `POST /categories` **giữ trong `category/`** với `JwtAdminGuard` method-level (KHÔNG dời sang `/admin/*` ở plan này) | Admin module chưa duyệt/làm — tạo cả module admin chỉ để chứa 1 endpoint là thừa; khi nào làm admin mới dời |
| D5 | `GET /categories` → **public**, bỏ `JwtTokenGuard` | Đúng spec "Catalog là public"; Flutter render category chips trước khi login |
| D6 | Xoá `jwt-token.guard.ts` + `jwt-token.strategy.ts` (+ đăng ký trong `AuthModule`) | Sau D5 không còn chỗ nào dùng (đã grep — chỉ `catalog.controller.ts` dùng); `JwtStrategy('jwt')` verify + load user từ DB, `JwtTokenStrategy` chỉ decode payload — giữ lại là dead code |
| D7 | Tạo `PrismaModule` `@Global()` export `PrismaService`; bỏ `PrismaService` khỏi providers của từng feature module | Hiện 5 modules (`auth/address/catalog/profile/payment`) tự provide → verbose, mỗi module một instance/pool |
| D8 | Tạo `src/dto/pagination.dto.ts`: `PaginationQueryDto` (page/limit) + `PaginationMetaDto` (page/limit/total/totalPages) | `src/dto/` chưa tồn tại (đúng như `AGENTS.md` mô tả shared DTOs — đây là file shared đầu tiên); ~4 list endpoints dùng chung |
| D9 | Service map `Decimal → number` trước khi trả (price, originalPrice, ratingAvg); backend chỉ trả số, **client tự format hiển thị** | JSON ổn định cho Flutter |
| D10 | `isInWishlist` trả `false` hằng số ở product list/detail phase này; client đã login tự join từ `GET /wishlist` | Thu hẹp scope, tránh optional-JWT; `WishlistRepository.findProductIdsByUser` để dành khi cần |

---

## 1. Hiện trạng code (đã rà soát)

| Thành phần | Hiện tại | Vấn đề → hướng xử lý |
|---|---|---|
| `src/modules/catalog/` (5 file, ~200 dòng) | Controller: `GET /catalog/categories` (`JwtTokenGuard`) + `POST /catalog/categories` (`JwtAdminGuard`); Service: chỉ logic categories | `catalog.module.ts` đăng ký **8 providers** (`PrismaService` + 6 repos + `CatalogService`) nhưng chỉ dùng `CategoryRepository` (5 repos thừa) → D1 |
| `src/repositories/` (9 repo) | `ProductRepository` đã có đủ query public catalog: `buildWhere` (status/category/price/onSale/search/variant màu+size), `resolveOrderBy` (`newest\|price_asc\|price_desc\|popular\|best_selling\|rating`), `findPaginated`, `findBySlug/ById`, `findRelated`, `findHotDeals/NewArrivals/OnSale`, `findHomeFeed`, `findDistinctCategories`, `getPriceBounds`...; `ProductVariantRepository` (stock, distinct màu/size); `ProductReviewRepository.createAndRecalcRating` (tx); `WishlistRepository` (unique `userId+productId`) | **Tái sử dụng hết, không viết lại query** |
| `src/modules/{cart,coupon,order,review,wishlist}` | Thư mục rỗng (placeholder) | `review/` + `wishlist/` dùng ở plan này; `cart/coupon/order` để phase sau |
| `PrismaService` | Provide lặp ở 5 modules | → D7 |
| `src/dto/` | **Không tồn tại** | → D8 |
| Guards/strategies | 3 cặp: `JwtAuthGuard` (`jwt` — verify + load user từ DB, trả `AuthenticatedUser{id,email,firstName,lastName,role}`), `JwtTokenGuard` (`jwt-token` — chỉ decode payload), `JwtAdminGuard` (`jwt-admin` — verify role ADMIN) | Endpoint user cần `req.user.id` → `JwtAuthGuard`; admin → `JwtAdminGuard`; xoá `jwt-token` (D6) |
| Envelope response | `ResponseInterceptor` global, `ValidationPipe { whitelist, transform }` global (`main.ts`) | Giữ nguyên; DTO mới tuân thủ (không field thừa lọt qua) |

---

## 2. Cấu trúc đích

```
src/
├── app.module.ts                      # - CatalogModule; + PrismaModule(global), Category/Product/Review/WishlistModule
├── prisma/
│   ├── prisma.service.ts
│   └── prisma.module.ts               # MỚI (phase 1) — @Global, exports PrismaService
├── dto/
│   └── pagination.dto.ts              # MỚI (phase 1) — PaginationQueryDto + PaginationMetaDto
├── repositories/                      # giữ nguyên 9 repo, không thêm
└── modules/
    ├── auth/                          # bỏ JwtTokenStrategy khỏi providers/exports; xoá guard+strategy jwt-token (phase 2)
    │
    ├── category/                      # từ catalog/ cũ đổi tên + đổi route (phase 2)
    │   ├── category.controller.ts     # @Controller('categories'): GET / (public), POST / (JwtAdminGuard)
    │   ├── category.service.ts        # giữ logic getCategories + createCategory (409 slug trùng)
    │   ├── category.module.ts         # providers: CategoryRepository, CategoryService (+ AuthModule import cho guard)
    │   └── dto/
    │       ├── request/create-category.ts   # move nguyên (name/slug regex/imagePath/isActive)
    │       └── response/category.ts         # move nguyên
    │
    ├── product/                       # MỚI (phase 3) — READ public, 1 controller
    │   ├── product.controller.ts      # @Controller('products'), toàn public, static routes trước ':slug'
    │   ├── product.service.ts         # map Decimal→number, ảnh cover = GALLERY sortOrder nhỏ nhất
    │   ├── product.module.ts          # providers: ProductRepository (+ CategoryRepository validate categorySlug)
    │   └── dto/
    │       ├── request/list-products.query.ts   # q, categorySlug, min/maxPrice, colors[], sizes[], onSale, sort, page, limit
    │       └── response/product-item.ts / product-detail.ts / home-feed.ts / filter-options.ts
    │
    ├── wishlist/                      # MỚI (phase 4) — lấp folder rỗng, pattern y hệt address/
    │   ├── wishlist.controller.ts     # @Controller('wishlist'), cả 3 endpoints JwtAuthGuard
    │   ├── wishlist.service.ts        # 404 product / 409 trùng / 404 chưa wishlist (check exists trước, không phụ thuộc filter)
    │   ├── wishlist.module.ts         # providers: WishlistRepository (+ ProductRepository check ACTIVE)
    │   └── dto/
    │       ├── request/add-wishlist.ts      # { productId: number }
    │       └── response/wishlist-item.ts
    │
    ├── review/                        # MỚI (phase 5) — lấp folder rỗng
    │   ├── review.controller.ts       # @Controller('products/:productId/reviews'): GET / (public), POST / (JwtAuthGuard method-level)
    │   ├── review.service.ts          # 404 product (!ACTIVE) → existsByProductAndUser → 409 → createAndRecalcRating
    │   ├── review.module.ts           # providers: ProductReviewRepository (+ ProductRepository, UserRepository lấy tên/avatar)
    │   └── dto/
    │       ├── request/create-review.ts     # { rating 1–5, comment } — userName/avatar từ User row, KHÔNG nhận từ body
    │       └── response/review.ts
    │
    └── catalog/                       # XOÁ toàn bộ
```

Quy ước: DTO đặt trong `dto/request|response` của từng module (kebab-case, như `address/`); import relative đuôi `.js`; Swagger `@ApiTags('<tên>')` + `@ApiBearerAuth()` cho endpoints auth (copy mẫu `address.controller.ts`).

---

## 3. Bảng phân bổ endpoint (old → new)

### 3.1 Category — module `category`

| Method | Path mới | Guard | Trạng thái |
|--------|---------|-------|------------|
| GET | `/categories` | public (bỏ guard — D5) | đã có → move + đổi prefix (`GET /catalog/categories` cũ xoá) |
| POST | `/categories` | `JwtAdminGuard` | đã có → move + đổi prefix (`POST /catalog/categories` cũ xoá), giữ 409 slug — D4 |

### 3.2 Product — module `product` (toàn public)

| Method | Path mới | Nguồn repo | Trạng thái |
|--------|---------|-----------|------------|
| GET | `/products` | `findPaginated` + `count` (tx sẵn) | mới (phase 3). Query: `q, categorySlug, minPrice, maxPrice, colors[], sizes[], onSale, sort, page, limit` |
| GET | `/products/home` | `findAllActive` + `findHomeFeed` (hotDeals/newArrivals/onSale) | mới (phase 3) |
| GET | `/products/search` | `findPaginated` + `findDistinctCategories` → `filterCategories` | mới (phase 3). `q` bắt buộc |
| GET | `/products/filters` | `findAllActive` + `getDistinctColors/getDistinctSizes` + `getPriceBounds` | mới (phase 3) |
| GET | `/products/:slug` | `findBySlug` (+ `findRelated` + `findLatest` reviews) | mới (phase 3). 404 nếu không tồn tại hoặc `status != ACTIVE` |
| GET | `/products/:slug/related` | `findRelated` | mới (phase 3) |

> ⚠️ Thứ tự khai báo trong controller: static routes (`home/search/filters`) **trước** `:slug`, nếu không Nest match nhầm `home` thành slug.

### 3.3 Wishlist — module `wishlist` (`JwtAuthGuard` cả 3)

| Method | Path mới | Trạng thái |
|--------|---------|-----------|
| GET | `/wishlist` | mới (phase 4). `listByUser` (join product/category/images) |
| POST | `/wishlist` `{ productId }` | mới (phase 4). 404 nếu product không ACTIVE → 409 nếu `existsByUserAndProduct` (unique `userId+productId`) |
| DELETE | `/wishlist/:productId` | mới (phase 4). 404 nếu `!exists` rồi mới `remove` |

### 3.4 Review — module `review`

| Method | Path mới | Guard | Trạng thái |
|--------|---------|-------|------------|
| GET | `/products/:productId/reviews` | public | mới (phase 5). `findByProductId` paginated + `countByProductId` |
| POST | `/products/:productId/reviews` | `JwtAuthGuard` | mới (phase 5). Body `{ rating, comment }`; xem Phụ lục A.7 |

---

## 4. Kế hoạch thực hiện theo phase

### Phase 1 — Hạ tầng (không đổi API)
- `src/prisma/prisma.module.ts`: `@Global({ providers: [PrismaService], exports: [PrismaService] })`; `AppModule` import; **xoá `PrismaService`** khỏi providers của Auth/Address/Catalog/Profile/Payment modules.
- `src/dto/pagination.dto.ts`: `PaginationQueryDto { page = 1, limit = 20 }` (`@Type(() => Number)`, `@IsInt @Min(1)`, limit `@Max(100)`) + `PaginationMetaDto { page, limit, total, totalPages }`. Mỗi list response tự khai báo `{ items: T[]; pagination: PaginationMetaDto }`.
- Verify: build + gọi lại 2 endpoint cũ (GET/POST categories) → behavior giữ nguyên.

### Phase 2 — Module `category` + xoá `catalog/` + xoá `jwt-token` (D1, D4, D5, D6)
- Tạo `category/` (controller/service/module/dto như mục 2, route `@Controller('categories')`, `GET /` public + `POST /` admin); xoá `src/modules/catalog/`.
- Xoá `jwt-token.guard.ts` + `jwt-token.strategy.ts`, gỡ khỏi `AuthModule` providers/exports.
- `AppModule`: bỏ `CatalogModule`, thêm `CategoryModule`.
- Verify: `GET /categories` không token OK; `POST /categories` token admin → 201, token user → 403, slug trùng → 409; build không còn import `jwt-token` nào.

### Phase 3 — Module `product` (dùng repo có sẵn)
- Query DTO + 6 endpoints GET (mục 3.2); service map ảnh cover + Decimal→number; `isInWishlist: false` (D10).
- `AppModule`: thêm `ProductModule`.
- Verify: 6 endpoint public qua swagger/curl (dùng skill `test-api`); case 404 slug lạ / slug DRAFT; `home/search/filters` đúng shape Phụ lục A.

### Phase 4 — Module `wishlist`
- Controller/service/module/dto như mục 2; `userId` từ `req.user.id` (pattern `address.controller.ts`); check product ACTIVE qua `ProductRepository.findById`.
- `AppModule`: thêm `WishlistModule`.
- Verify: không token → 401 cả 3; thêm trùng → 409; xoá thứ chưa có → 404; `GET /wishlist` trả kèm product/category/cover.

### Phase 5 — Module `review` (D3)
- `GET /` public + `POST /` (`JwtAuthGuard` method-level — KHÔNG class-level để khỏi chặn GET).
- `ReviewService`: `findById` product → 404 nếu null/không ACTIVE → `existsByProductAndUser` → 409 → load User row (`firstName/lastName/avatarPath`) → `createAndRecalcRating` (`Prisma.ProductReviewCreateInput`, `rating` number 1–5 hợp lệ cho `Decimal(2,1)`).
- `AppModule`: thêm `ReviewModule`.
- Verify: POST có token → 201 + `ratingAvg/reviewCount` đổi đúng; POST trùng user → 409; không token → 401; product DRAFT → 404.
- TODO ghi trong code: rule "chỉ review khi đã mua" làm sau khi có Order module.

---

## 5. Breaking changes & Flutter impact

| Đổi | Impact | An toàn? |
|-----|--------|----------|
| `GET /catalog/categories` → `GET /categories` (bỏ guard) | Client cũ có token vẫn gọi được path mới; path cũ xoá | ✅ Flutter catalog đang mock, map lại 1 lần |
| `POST /catalog/categories` → `POST /categories` | Cùng tình huống trên | ✅ Chưa có client thật dùng endpoint này |
| Endpoints mới (`/products*`, `/wishlist`, `*/reviews`) | Flutter thêm vào `api_endpoint.dart`, bỏ mock dần: `catalog` → `wishlist` → `product detail/review` | ✅ |
| Response envelope | Giữ `BaseResponse { code, data, message }` như hiện tại | ✅ |

## 6. Ràng buộc schema — KHÔNG đổi trong kế hoạch này

- `ProductReview` chưa có `isHidden/status` → moderation admin chỉ có thể DELETE (phase sau).
- `ProductReview.userId` nullable + `@@unique([productId, userId])`: Postgres coi NULL khác nhau → phase này `userId` luôn lấy từ token (non-null) nên 409 double-review vẫn đúng; guest review để tương lai.
- `User` chưa có `isActive/isBanned` → chưa làm khoá tài khoản.
- Chưa có `SubCategory`/tag → `filters.categoryGroups`: mỗi group `title` = tên category active, `items: []`; mở rộng khi schema thêm.
- `ProductVariant` unique `productId+colorHexCode+size` giữ nguyên.
- Không migration nào trong plan này.

## 7. Checklist cần bạn duyệt

- [ ] **D1+D2**: xoá `catalog/`, tách 4 modules, route REST chuẩn (thay vì giữ `/catalog/*`)
- [ ] **D4**: `POST /categories` giữ trong `category/`, chưa dời sang `/admin/*`
- [ ] **D5+D6**: `GET /categories` public + xoá hẳn `jwt-token` guard/strategy
- [ ] **D7+D8**: `PrismaModule` global + `src/dto/pagination.dto.ts` shared
- [ ] **D10**: `isInWishlist = false` phase này
- [ ] **Phạm vi code**: phases 1 → 5 (hạ tầng + 4 modules = cái Flutter cần để bỏ mock catalog/wishlist/review)

---

## PHỤ LỤC A — API contract (routes mới)

### A.1 GET /categories
```json
[
  { "id": 1, "name": "Men", "slug": "men", "imagePath": "https://.../men.png", "isActive": true }
]
```

### A.2 GET /products/home
```json
{
  "categories": [ { "id": 1, "name": "Men", "slug": "men", "imagePath": "https://..." } ],
  "hotDeals":    [ { "id": 1, "slug": "printed-cotton-shirt", "name": "Printed Cotton Shirt", "imagePath": "https://...", "price": 45, "originalPrice": 60, "soldCount": 358 } ],
  "newArrivals": [ { "id": 2, "slug": "cotton-t-shirt", "name": "Cotton T-Shirt", "imagePath": "https://...", "price": 49, "soldCount": 50 } ],
  "onSale":      [ { "id": 3, "slug": "ankle-boots", "name": "Ankle Boots", "imagePath": "https://...", "price": 180, "originalPrice": 219, "soldCount": 358 } ]
}
```
> `hotDeals`: sort `soldCount` desc · `newArrivals`: sort `createdAt` desc · `onSale`: `originalPrice IS NOT NULL`, sort `soldCount` desc (khớp `findHotDeals/findNewArrivals/findOnSale/findHomeFeed` trong repo).

### A.3 GET /products
Query: `q`, `categorySlug`, `minPrice`, `maxPrice`, `colors[]` (int), `sizes[]`, `onSale` (bool), `sort` (`newest|price_asc|price_desc|popular|best_selling|rating` — đủ 6 giá trị của `ProductListSort`), `page`=1, `limit`=20.
```json
{
  "items": [
    { "id": 1, "slug": "printed-cotton-shirt", "name": "Printed Cotton Shirt", "price": 45, "originalPrice": 60,
      "ratingAvg": 4.8, "reviewCount": 12, "soldCount": 358, "imagePath": "https://...", "isInWishlist": false }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 100, "totalPages": 5 }
}
```

### A.4 GET /products/:slug (+ /products/:slug/related)
```json
{
  "id": 1, "slug": "printed-cotton-shirt", "name": "Printed Cotton Shirt",
  "price": 45, "originalPrice": 60, "ratingAvg": 4.8, "reviewCount": 12, "soldCount": 358,
  "description": "Short description...", "detailedDescription": "Long description...",
  "images": [ { "id": 1, "imagePath": "https://...", "type": "GALLERY", "sortOrder": 0 } ],
  "variants": [ { "id": 1, "colorHexCode": 16140745, "size": "M", "price": 45, "stock": 10, "isActive": true } ],
  "reviews": [ { "id": 1, "userName": "Theresa Webb", "avatarPath": "https://...", "rating": 5, "comment": "Great!", "createdAt": "2026-09-01T10:00:00Z" } ],
  "relatedProducts": [ { "id": 2, "slug": "cotton-t-shirt", "name": "Cotton T-Shirt", "price": 49, "imagePath": "https://...", "soldCount": 50 } ]
}
```
> `reviews` = `findLatest(productId, 3)`; list full xem A.7-GET.

### A.5 GET /products/search?q=shirt
```json
{
  "query": "shirt",
  "filterCategories": ["Shoes", "Dresses", "Shirts"],
  "products": [ { "id": 1, "slug": "printed-cotton-shirt", "name": "Printed Cotton Shirt", "price": 45, "originalPrice": 60, "imagePath": "https://...", "type": "Shirts" } ]
}
```
> `filterCategories`: distinct tên category **có trong kết quả** (`findDistinctCategories`). Giá hiển thị (`"$ 45.00"`) do **Flutter tự format** từ `price`/`originalPrice` (D9).

### A.6 GET /products/filters
```json
{
  "categoryGroups": [ { "title": "Men", "items": [] } ],
  "colorValues": [16140782, 16039951, 8891960],
  "sizes": ["S", "M", "L", "XL"],
  "minPrice": 0,
  "maxPrice": 999
}
```
> `colorValues` = `ProductVariant.colorHexCode` distinct active (`getDistinctColors`). `min/maxPrice` = aggregate thực tế (`getPriceBounds`). `categoryGroups.items` rỗng — xem mục 6.

### A.7 Review — GET + POST /products/:productId/reviews
GET (public, `page`=1, `limit`=10):
```json
{
  "items": [ { "id": 1, "userName": "Theresa Webb", "avatarPath": "https://...", "rating": 5, "comment": "Great!", "createdAt": "2026-09-01T10:00:00Z" } ],
  "pagination": { "page": 1, "limit": 10, "total": 12, "totalPages": 2 }
}
```
POST (JWT) — body **đúng schema** (`rating` + `comment`; tên/avatar lấy từ User row theo `req.user.id`, không nhận từ body):
```json
{ "rating": 5, "comment": "Great product!" }
```
Response 201:
```json
{ "id": 1, "productId": 1, "userName": "Theresa Webb", "avatarPath": null, "rating": 5, "comment": "Great product!", "createdAt": "2026-09-01T10:00:00Z" }
```

### A.8 Wishlist — GET / POST / DELETE /wishlist (JWT)
POST body: `{ "productId": 1 }` → 201 item (kèm product/category/cover như `listByUser`).
DELETE `/wishlist/:productId` → 200 item đã xoá (404 nếu chưa wishlist).

### A.9 Mapping Flutter ↔ Backend

| Flutter field | Backend field | Ghi chú |
|---|---|---|
| `HomeCategory.name/imagePath` | `Category.name/imagePath` | URL tuyệt đối |
| `HomeProduct.imagePath` | `ProductImage.imagePath` | ảnh GALLERY `sortOrder` nhỏ nhất |
| `HomeProduct.price/soldCount` | `Product.price/soldCount` | Decimal → number (D9) |
| `DetailCatagoriesProduct.soldLabel` | _(computed)_ | Flutter format "Đã bán {n}" |
| `DetailCatagoriesProduct.type` | `Category.name` | chưa có SubCategory (mục 6) |
| `ProductDetail.colorHexCodes/sizes` | `ProductVariant` distinct active | |
| `ProductDetail.rating` | `Product.ratingAvg` | |
| `SearchProductItem` giá hiển thị | _(computed)_ | Flutter tự format từ price/originalPrice |
| `SearchFilterModel.minPrice/maxPrice` | `getPriceBounds` | |

---

## 8. Định hướng phase sau (CHƯA DUYỆT — không làm trong plan này)

- **Shopper flow**: `cart/` (`GET /cart`, add/update/remove item, validate `variant.stock`), `coupon/` (`GET /coupons` active, `POST /coupons/validate`), `order/` (`POST /orders` transaction + `idempotencyKey` + `addressSnapshot`, `GET /orders`, `GET /orders/:id`, `PATCH /orders/:id/cancel`), rule "chỉ review khi đã mua".
- **Admin**: gom endpoint admin theo domain (`/admin/categories`, `/admin/products` + nested images/variants, `/admin/orders`, `/admin/coupons`, `/admin/users`, `/admin/reviews`, `/admin/dashboard/stats`), guard `JwtAdminGuard` class-level, enums import từ `prisma/generated/prisma/enums.js`, soft-delete Product → `ARCHIVED`. Khi đó mới dời `POST /categories` sang `/admin/categories` (D4).
- Chi tiết admin sẽ lập plan riêng sau khi phases 1 → 5 xong và Flutter bỏ mock catalog/wishlist/review ổn định.
