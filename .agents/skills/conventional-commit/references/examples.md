# Ví dụ commit message theo ngữ cảnh dự án

Repo: NestJS 11 + Prisma 7 + PostgreSQL. Module: `auth`, `profile`, `category`, `product`, `payment`, `address`.

## Theo loại thay đổi

### Thêm endpoint mới

```text
feat(product): thêm endpoint lấy danh sách sản phẩm theo category

Hỗ trợ phân trang (page/limit) và filter q, categoryId.
Trả về PaginationMetaDto kèm danh sách.

Closes #88
```

### Sửa bug

```text
fix(auth): sửa lỗi refresh token hết hạn vẫn tạo được access token

Kiểm tra lại exp của refresh token trước khi verify chữ ký.
```

### Đổi DTO / validation

```text
refactor(profile): chuyển validation số điện thoại sang DTO riêng

Không đổi contract của API, chỉ gom rule vào UpdateProfileDto.
```

### Prisma schema + migration

```text
feat(prisma): thêm model Cart và CartItem

- thêm relation Cart -> CartItem (onDelete: Cascade)
- chạy prisma migrate dev + generate

Refs #102
```

```text
chore(db): tạo migration index cho product.name
```

### Cấu hình / hạ tầng

```text
chore(config): thêm biến JWT_REFRESH_EXP vào .env.example
ci: thêm bước pnpm run lint trước khi build
build(deps): nâng @prisma/client lên 7.9.1
docs(swagger): bổ sung @ApiResponse cho endpoint payment
```

### Test / format

```text
test(auth): thêm unit test cho AuthService.login
style: format lại src/modules/product theo prettier
```

### Revert

```text
revert: revert "feat(cart): thêm API áp mã giảm giá"

API chưa có mã giảm giá trong DB, revert để tránh lỗi 500.
```

## Breaking change

Dùng `!` sau type/scope **và** footer `BREAKING CHANGE:`:

```text
feat(api)!: đổi response phân trang sang { data, meta }

BREAKING CHANGE: `items` được đổi tên thành `data` và
`meta` chuyển ra ngoài. Client cũ phải cập nhật.
```

## So sánh đúng / sai (theo tình huống thật)

| Tình huống                        | ❌ Sai                                  | ✅ Đúng                                                        |
| --------------------------------- | --------------------------------------- | -------------------------------------------------------------- |
| Sửa lỗi tính tiền trong giỏ hàng   | `fix bug tính tiền`                     | `fix(cart): sửa lỗi tính tổng tiền khi giỏ hàng trống`          |
| Thêm login Google                  | `update code`                           | `feat(auth): thêm đăng nhập bằng Google`                        |
| Sửa README                         | `sửa README`                            | `docs: cập nhật hướng dẫn chạy local`                           |
| Nâng version nestjs                | `nâng cấp nestjs`                       | `build(deps): nâng @nestjs/core lên 11.0.1`                     |
| Format code module product         | `format`                                | `style(product): format lại theo prettier`                      |
| Commit tạm WIP                     | `wip`                                   | `chore: wip cập nhật product service` (hoặc `HUSKY=0` cho nhánh cá nhân) |
| Tách hàm validate                  | `refactor`                              | `refactor(user): tách hàm validate ra util riêng`                |
| Sửa lỗi nhiều module               | `fix: fix all`                          | Tách thành nhiều commit: `fix(auth): ...`, `fix(payment): ...`   |

## Khi nào tách commit

Một commit = một ý nghĩa. Nếu message phải dùng "and" để mô tả, hãy tách:

```bash
git add src/modules/auth
git commit -m "feat(auth): thêm đăng nhập bằng Google"

git add src/modules/product
git commit -m "fix(product): sửa lỗi filter theo categoryId"
```

## Sửa commit message đã tạo

```bash
# Commit cuối (chưa push) — hook commit-msg sẽ chạy lại
git commit --amend

# Đổi message sang 1 dòng ngay không cần editor
git commit --amend -m "fix(cart): sửa lỗi tính tổng tiền"

# Commit cũ hơn dùng interactive rebase (đổi pick -> reword)
git rebase -i HEAD~3
```

> Lưu ý: hook chỉ chạy khi **tạo** commit. Commit cũ sửa bằng `rebase` sẽ không bị kiểm tra lại — phải tự viết đúng chuẩn.