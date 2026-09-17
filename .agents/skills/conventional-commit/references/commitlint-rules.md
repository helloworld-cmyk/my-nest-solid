# commitlint rules — repo my-nest-solid

Bảng rule đang có hiệu lực, lấy từ `@commitlint/config-conventional@21.x` cộng với phần override trong `commitlint.config.mjs` của repo.

Severity: `2` = error (**chặn commit**), `1` = warning (in cảnh báo, commit vẫn đi tiếp).

## Rule hiệu lực

| Rule                     | Severity | Cấu hình                                              | Ý nghĩa                                                                 |
| ------------------------ | -------- | ----------------------------------------------------- | ----------------------------------------------------------------------- |
| `type-empty`             | 2 error  | `never`                                               | Bắt buộc có `type` (phải có dấu `:` sau type)                            |
| `type-enum`              | 2 error  | `build, chore, ci, docs, feat, fix, perf, refactor, revert, style, test` | Type phải nằm trong danh sách                                       |
| `type-case`              | 2 error  | `always`, `lower-case`                                | Type phải viết thường (`Feat` ✗)                                        |
| `subject-empty`          | 2 error  | `never`                                               | Bắt buộc có mô tả sau `: `                                              |
| `subject-full-stop`      | 2 error  | `never`, `.`                                          | Subject không được kết thúc bằng dấu chấm                                 |
| `subject-case`           | 2 error  | `never`, `sentence-case/start-case/pascal-case/upper-case` | Subject không được viết hoa kiểu câu/Title Case/Pascal/UPPER        |
| `header-max-length`      | 2 error  | `always`, `100`                                       | Cả dòng header tối đa 100 ký tự                                          |
| `header-trim`            | 2 error  | `always`                                              | Header không có khoảng trắng thừa ở đầu/cuối                              |
| `body-leading-blank`     | 1 warn   | `always`                                              | Body phải cách header 1 dòng trống                                       |
| `body-max-line-length`   | 2 error  | `always`, `100`                                        | Mỗi dòng body ≤ 100 ký tự                                                |
| `footer-leading-blank`   | 1 warn   | `always`                                              | Footer phải cách phần trên 1 dòng trống                                  |
| `footer-max-line-length` | 2 error  | `always`, `100`                                        | Mỗi dòng footer ≤ 100 ký tự                                              |
| `scope-enum`             | 1 warn   | danh sách scope của dự án (xem `SKILL.md`)             | Cảnh báo khi scope lạ — **chỉ dùng warning** nên không chặn commit        |

`subject-case` chỉ áp dụng cho subject (phần sau `type(scope): `), **không** áp dụng cho scope.

## Lỗi thường gặp → cách sửa

| Message commitlint in ra                                                     | Nguyên nhân                              | Sửa thành                                  |
| ---------------------------------------------------------------------------- | ---------------------------------------- | ------------------------------------------ |
| `type may not be empty`                                                       | `git commit -m "sửa lỗi"`                 | `fix: sửa lỗi ...`                          |
| `type must be one of [build, chore, ci, docs, feat, fix, ...]`                 | Dùng type tự chế (`update`, `add`, `wip`) | Chọn type đúng trong bảng                   |
| `type must be lower-case`                                                     | `Feat: ...`                              | `feat: ...`                                 |
| `subject may not be empty`                                                    | `fix:` không có mô tả                     | `fix: sửa lỗi tính tổng tiền`               |
| `subject may not have a full stop`                                            | `fix: sửa lỗi login.`                     | `fix: sửa lỗi login`                        |
| `subject must not be sentence-case, start-case, pascal-case, upper-case`       | `feat: Thêm login` / `feat: Them Login`   | `feat: thêm login`                          |
| `header must not be longer than 100 characters`                                | Header quá dài                            | Rút ngắn; chi tiết đưa xuống body           |
| `body's lines must not be longer than 100 characters`                          | Body có dòng quá dài                      | Ngắt dòng ≤ 100 ký tự                       |
| `body must have leading blank line`                                            | Body dính liền header                     | Thêm 1 dòng trống giữa header và body       |
| `scope must be one of [...]` (warning)                                        | Scope mới chưa khai báo                    | Thêm scope vào `commitlint.config.mjs`      |

## Ví dụ chạy tay để tự kiểm tra

```bash
# Message đúng → không in gì, exit 0
echo "feat(auth): thêm đăng nhập bằng Google" | pnpm exec commitlint

# Message sai → in danh sách lỗi, exit 1
echo "update code" | pnpm exec commitlint
# ⧗   input: update code
# ✖   type may not be empty [type-empty]
# ✖   subject may not be empty [subject-empty]

# Message sai nhưng muốn xem cả warning
echo "feat(abc): thêm gì đó" | pnpm exec commitlint --verbose
```

## Đổi rule

Sửa `commitlint.config.mjs` — mọi rule đều có dạng `[severity, applicable, value]`:

```js
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'header-max-length': [2, 'always', 120], // nới lên 120
    'scope-enum': [0],                       // tắt hẳn cảnh báo scope
  },
};
```

Tham chiếu đầy đủ các rule có sẵn: <https://commitlint.js.org/reference/rules.html>