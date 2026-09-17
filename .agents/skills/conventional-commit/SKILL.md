---
name: conventional-commit
description: Viết và kiểm tra commit message theo chuẩn Conventional Commits cho repo my-nest-solid (Husky + commitlint). Use when creating a commit, writing or fixing a commit message, when the commit-msg hook blocks a commit, when auditing recent commit history, or when configuring husky/commitlint.
license: MIT
metadata:
  author: local
  version: "1.0.0"
---

# Conventional Commit

Skill chuẩn hoá commit message cho repo `my-nest-solid`. Hook `commit-msg` (Husky) gọi commitlint để **chặn commit** nếu message sai chuẩn.

## Khi nào dùng skill này

- Chuẩn bị `git commit` → viết message đúng ngay từ đầu.
- Commit bị chặn với lỗi kiểu `type may not be empty`, `subject may not be empty`, `subject must not be sentence-case...`.
- Viết body/footer, đánh dấu breaking change, gắn issue.
- Audit lịch sử commit (ví dụ "0/10 commit đúng chuẩn").
- Cấu hình/sửa `commitlint.config.mjs`, `.husky/commit-msg`, `.husky/pre-commit`.

## Format chuẩn

```text
type(scope): subject

body (tuỳ chọn)

footer (tuỳ chọn)
```

| Phần      | Bắt buộc | Quy tắc                                                                               |
| --------- | -------- | ------------------------------------------------------------------------------------- |
| `type`    | ✅       | lowercase, thuộc danh sách type (xem bảng dưới)                                        |
| `scope`   | ❌       | lowercase, nên là module/area của dự án (xem bảng scope)                               |
| `subject` | ✅       | không viết hoa chữ đầu, **không** kết thúc bằng `.`, thể imperative, ngắn gọn          |
| `body`    | ❌       | cách header 1 dòng trống; giải thích *vì sao*; mỗi dòng ≤ 100 ký tự                    |
| `footer`  | ❌       | `BREAKING CHANGE: ...`, `Closes #123`, `Refs #456`; mỗi dòng ≤ 100 ký tự               |

Ràng buộc độ dài: **header ≤ 100 ký tự** (gồm cả `type(scope): `).

## Type được phép

| Type       | Dùng khi                                                     | Ví dụ                                        |
| ---------- | ------------------------------------------------------------ | -------------------------------------------- |
| `feat`     | Thêm tính năng / endpoint / field mới cho người dùng          | `feat(cart): thêm API áp mã giảm giá`         |
| `fix`      | Sửa bug                                                      | `fix(auth): sửa lỗi refresh token hết hạn`    |
| `docs`     | Chỉ sửa tài liệu (`README.md`, `AGENTS.md`, `.agents/plan/`)  | `docs: cập nhật hướng dẫn chạy local`         |
| `style`    | Format, white-space, dấu chấm phẩy — không đổi logic          | `style: format lại module product`            |
| `refactor` | Đổi cấu trúc code, không thêm tính năng, không sửa bug        | `refactor(user): tách hàm validate`           |
| `perf`     | Tối ưu hiệu năng                                             | `perf(product): thêm index cho truy vấn search` |
| `test`     | Thêm/sửa test                                                | `test(auth): thêm unit test cho login`        |
| `build`    | Build system, bundler, dependencies (ảnh hưởng build)         | `build: nâng TypeScript lên 5.9`              |
| `ci`       | Cấu hình CI/CD                                               | `ci: thêm job lint vào pipeline`              |
| `chore`    | Việc lặt vặt, không đụng `src`/`test`                         | `chore: cập nhật dependencies`                |
| `revert`   | Revert commit trước đó                                       | `revert: revert "feat(auth): thêm login Google"` |

## Scope của dự án

Module chức năng (`src/modules/*`): `auth`, `profile`, `category`, `product`, `payment`, `address`.

Hạ tầng / cross-cutting: `prisma`, `db`, `config`, `swagger`, `socket`, `docker`, `ci`, `deps`, `docs`, `repo`.

`scope-enum` được đặt ở mức **warning**, nên scope ngoài danh sách vẫn commit được — nhưng hãy bổ sung scope mới vào `commitlint.config.mjs` khi tạo area mới.

## Ví dụ đúng

```text
feat(auth): thêm đăng nhập bằng Google
fix(cart): sửa lỗi tính tổng tiền khi giỏ hàng trống
docs: cập nhật README
refactor(product): tách mapper sang utils/converDtoResponse
test(auth): thêm test cho luồng refresh token
chore: cập nhật dependencies
```

Commit có body + footer:

```text
fix(payment): sửa lỗi xác thực chữ ký webhook

So sánh HMAC bằng timingSafeEqual để tránh timing attack
và log lại payload khi chữ ký không khớp.

Closes #142
```

## Ví dụ sai

```text
update code                    # thiếu type + subject
fix bug                        # thiếu dấu ':' → type rỗng
sửa lỗi                        # không có type
abc                            # không có type/subject
Fix(auth): Sửa lỗi login.      # type sai case + subject viết hoa + có dấu '.'
feat: <header dài quá 100 ký tự>  # lỗi header-max-length
```

## Luồng hoạt động

```text
git commit -m "..."
      ↓
Husky hook .husky/commit-msg
      ↓
pnpm exec commitlint --edit "$1"   (đọc commitlint.config.mjs)
      ↓
sai format → in lỗi, exit 1, commit bị chặn
đúng format → exit 0, commit được tạo
```

## Lệnh hay dùng

```bash
# Commit bình thường (message 1 dòng)
git commit -m "feat(auth): thêm đăng nhập bằng Google"

# Commit nhiều dòng: mở editor để nhập body/footer
git commit

# Kiểm tra 1 message bất kỳ mà không cần commit (commitlint đọc từ stdin)
echo "feat(auth): thêm đăng nhập bằng Google" | pnpm exec commitlint

# Audit 10 commit gần nhất (repo phải có đủ 10 commit)
pnpm exec commitlint --from HEAD~10 --to HEAD --verbose

# Chỉ kiểm tra commit mới nhất
pnpm exec commitlint --from HEAD~1 --to HEAD --verbose

# Sửa message của commit vừa tạo nếu gõ sai (hook commit-msg chạy lại)
git commit --amend
```

**Bỏ qua hook (chỉ dùng khi thật cần, ví dụ WIP trên nhánh cá nhân):**

```bash
HUSKY=0 git commit -m "wip"
git commit --no-verify -m "wip"
```

> Không dùng `--no-verify` cho commit sẽ push lên `master`/PR — changelog và review đều dựa vào commit message.

## File cấu hình trong repo

| File                               | Vai trò                                                     |
| ---------------------------------- | ----------------------------------------------------------- |
| `commitlint.config.mjs`            | Rule commitlint (extends `@commitlint/config-conventional`)  |
| `.husky/commit-msg`                | Chạy commitlint trên message đang commit                     |
| `.husky/pre-commit`                | Chạy `pnpm run lint` trước khi commit                        |
| `.husky/_/`                        | Shim do Husky sinh ra, đã gitignore — **không sửa**           |
| `package.json` → `scripts.prepare` | `husky` — cài hook mỗi lần `pnpm install`                    |

## References

- `references/commitlint-rules.md` — bảng rule hiệu lực trong repo + ví dụ vi phạm/tương ứng.
- `references/husky-setup.md` — Husky v9 hoạt động thế nào, cài đặt, xử lý lỗi thường gặp.
- `references/examples.md` — ví dụ đúng/sai theo tình huống thực tế của dự án.

## Ghi chú

- Nếu hook không chạy: `git config core.hooksPath` phải trả về `.husky/_`; nếu không, chạy `pnpm run prepare`.
- `pnpm run lint` trong `pre-commit` có `--fix`, có thể sửa file và làm chúng rời staging area — chạy `git add -u` rồi commit lại nếu cần.
