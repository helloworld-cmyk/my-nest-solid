Tôi đã phân tích xong cả 2 phía. Dưới đây là bức tranh hiện trạng và đề xuất.

## Hiện trạng

**Backend (`my-nest-solid`):**
- Đã có: `AuthModule` hoàn chỉnh (`login`, `register`, `refresh-token`, `profile`), `PrismaService`, exception filters, interceptor, `user.repository.ts`
- Schema đã đủ 13 models commerce: `Category`, `Product`, `ProductImage`, `ProductVariant`, `ProductReview`, `WishlistItem`, `Cart/CartItem`, `Order/OrderItem`, `Coupon/CouponRedemption`, `PaymentCard`, `UserAddress` (Device/Session/FCM đang comment — để phase sau)

**Flutter (`solid/lib`):**
- `auth` → đã gọi API thật (endpoints duy nhất trong `api_endpoint.dart`)
- `catalog`, `cart`, `checkout`, `wishlist`, `account` (profile/address/payment card/my order) → phần lớn đang dùng **mock data** (`address_mock_data.dart`, checkout mock datasource...)

Nghĩa là: backend cần dựng các module để Flutter bỏ mock dần, theo đúng thứ tự phụ thuộc dữ liệu.

## Đề xuất modules + thứ tự thực hiện

| # | Module | Lý do ưu tiên |
|---|--------|---------------|
| 0 | **Cốt lõi chung**: seed script (category/product mẫu), helper pagination/filter cho `BaseResponse` | Mọi module sau đều phụ thuộc dữ liệu catalog + format response thống nhất với Flutter |
| 1 | **Catalog** (`GET /categories`, `GET /products` có search/filter/sort/pagination, `GET /products/:slug`) — **public, không cần JWT** | Flutter `features/catalog` (home, product, categories, search, search_filter) đang mock; đây là màn hình đầu tiên user thấy |
| 2 | **Wishlist** (`GET/POST/DELETE /wishlist`) | Đơn giản nhất (1 bảng, unique `[userId, productId]`), chỉ phụ thuộc catalog — dễ ăn điểm đầu tiên có JWT |
| 3 | **Profile** (`PATCH /users/me`, đổi mật khẩu, upload avatar) | Flutter đã có `change_profile`, `crop_avatar`; tái dùng `user.repository` sẵn có |
| 4 | **Address** (`CRUD /users/me/addresses` + set default) | Flutter `address_list`/`add_address` đang mock; là input bắt buộc của checkout |
| 5 | **PaymentCard** (`CRUD /users/me/payment-cards` + isDefault) | Flutter `payment_card_list`/`add_payment_card` đang mock; chỉ lưu `cardToken`/`last4`, chưa cần gateway thật |
| 6 | **Cart** (`GET /cart`, add/update/remove item, validate `variant.stock` + `isActive`) | Phụ thuộc Product/Variant (bước 1); là tiền đề trực tiếp của checkout |
| 7 | **Coupon** (`GET /coupons` active, `POST /coupons/validate`) | Checkout cần tính `discount` — validate trước, redeem nằm trong Order |
| 8 | **Order / Checkout** (`POST /orders` transactional, `GET /orders`, `GET /orders/:id`, `PATCH /orders/:id/cancel`) | **Phức tạp nhất, để sau cùng khi mọi dependency sẵn sàng**: transaction (tạo Order + OrderItem snapshot, trừ stock, tăng `soldCount`, ghi `CouponRedemption`, xóa cart), xử lý `idempotencyKey`, `addressSnapshot`, `paymentMethod` COD/CARD |
| 9 | **Review** (`POST /products/:id/reviews`, chỉ user đã mua hàng; recompute `ratingAvg`/`reviewCount`) | Nên làm sau Order vì cần validate "đã mua" |
| 10 | *(Phase sau — schema đang comment)*: Device/Session/FCM notifications, cổng thanh toán thật, Admin CRUD products/coupons | Map với các comment "làm sau" trong schema và `features/notifications` trên Flutter |

## Lý do sắp xếp thứ tự này

1. **Theo dependency dữ liệu**: Catalog → Wishlist → User-related (Profile/Address/Card) → Cart → Coupon → Order → Review. Không thể làm Order trước khi Cart/Coupon/Address xong.
2. **Theo giá trị decode-mock trên Flutter**: catalog + wishlist cho hiệu ứng nhanh nhất; checkout là đích cuối.
3. **Tăng dần độ phức tạp**: module đầu chỉ READ public, module cuối là transaction nhiều bảng — giúp bạn ổn định pattern (DTO, repository, interceptor, test) trước khi vào chỗ khó.

## Lưu ý khi triển khai (theo convention hiện có)

- Modules đặt trong `src/modules/<tên>/` (controller/service/module/dto như `auth/`); DTO dùng chung trong `src/dto/`, repositories trong `src/repositories/`
- Import relative phải có đuôi `.js` (`module: nodenext`)
- Sau mỗi module: `pnpm run lint` → `pnpm run test` → `pnpm run build`
- Guard `jwt.guard.ts` có sẵn — áp cho mọi module từ #2 trở đi; Catalog (#1) để public

Nếu bạn muốn bắt tay vào làm, hãy **toggle to Act mode** và cho tôi biết bắt đầu từ module nào (tôi khuyên bắt đầu từ bước 0 + Catalog), tôi sẽ triển khai chi tiết từng module.