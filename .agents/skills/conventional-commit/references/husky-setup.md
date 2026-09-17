# Husky setup & troubleshooting (Husky v9)

Repo dùng **husky 9.1.7** + **@commitlint/cli 21.x** + **@commitlint/config-conventional 21.x**.

## Husky hoạt động thế nào

1. `pnpm install` chạy script `prepare` → `husky` (trong `package.json`).
2. Lệnh `husky` set `git config core.hooksPath .husky/_`.
3. Nó sinh thư mục `.husky/_/` gồm **shim** cho tất cả hook Git (`pre-commit`, `commit-msg`, `pre-push`, ...) và file runner `_/h`.
4. `.husky/_/.gitignore` chứa `*` → toàn bộ shim không được commit (mỗi máy tự sinh).
5. Khi bạn `git commit`, Git gọi `.husky/_/commit-msg` → shim `_/h` → tìm file `.husky/commit-msg` cùng tên và **chạy nó** nếu tồn tại.
6. Runner `_/h` prepend `node_modules/.bin` vào `PATH`, sau đó chạy script bằng `sh -e` và exit theo code của script.
7. Nếu script trả về exit code ≠ 0 → Git huỷ commit; husky in `husky - commit-msg script failed (code N)`.

Hệ quả quan trọng: **chỉ những file bạn tạo trong `.husky/` mới là hook thật** (ví dụ `.husky/commit-msg`). Không cần (và không nên) thêm `#!/usr/bin/env sh` hay `. "$(dirname -- "$0")/_/husky.sh"` — cú pháp đó đã deprecated và sẽ fail ở husky v10.

## Cài đặt trên máy mới

```bash
pnpm install          # chạy luôn "prepare": "husky"
# hoặc chạy tay:
pnpm run prepare
```

Kiểm tra:

```bash
git config core.hooksPath   # phải là .husky/_
ls -la .husky/              # phải thấy commit-msg, pre-commit
```

## File cấu hình của repo

| File                  | Nội dung                              | Ghi chú                           |
| --------------------- | ------------------------------------- | --------------------------------- |
| `.husky/commit-msg`   | `pnpm exec commitlint --edit "$1"`    | Chặn commit message sai chuẩn     |
| `.husky/pre-commit`   | `pnpm run lint`                       | ESLint + Prettier qua `--fix`     |
| `.husky/_/`           | Shim do husky sinh                    | Gitignored, xoá được, tự sinh lại |

Hook có thể thêm bằng:

```bash
echo 'pnpm run test' > .husky/pre-push
chmod +x .husky/pre-push
```

## Troubleshooting

| Triệu chứng                                              | Nguyên nhân                                          | Cách xử lý                                                                     |
| -------------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------ |
| `git commit` chạy bình thường, không kiểm tra gì          | Hook chưa được cài / `core.hooksPath` chưa set        | `pnpm run prepare`, rồi `git config core.hooksPath`                             |
| `husky - command not found in PATH=...`                   | Chưa `pnpm install` hoặc thiếu binary trong `node_modules/.bin` | `pnpm install`                                                    |
| Hook bị `permission denied`                              | File hook mất quyền thực thi                          | `chmod +x .husky/commit-msg .husky/pre-commit`                                 |
| `husky - commit-msg script failed (code 1)` + lỗi type/subject | Message sai Conventional Commits                 | Sửa message rồi commit lại (`git commit --amend`)                               |
| `.git can't be found` khi build Docker/CI                 | Image không copy `.git`                               | Đã an toàn: husky in cảnh báo rồi trả exit 0; hoặc đặt `HUSKY=0` khi install   |
| Muốn tắt hook tạm thời                                    |                                                       | `HUSKY=0 git commit -m "wip"` hoặc `git commit --no-verify`                     |
| Muốn skip riêng husky                                     |                                                       | Đặt biến môi trường `HUSKY=0` (husky check biến này ở cả lúc install và lúc chạy) |
| Muốn bật chế độ debug                                     |                                                       | `HUSKY=2 git commit` → in ra trace của shim                                     |
| Sửa `.husky/*` không có tác dụng                          | Đang sửa shim trong `.husky/_/`                       | Sửa file ở `.husky/` (không nằm trong `_/`)                                     |

## Liên quan file khác

- `commitlint.config.mjs` — rule chi tiết (`references/commitlint-rules.md`).
- `package.json` → `scripts.prepare: "husky"`, `scripts.commitlint: "commitlint"`.
- `AGENTS.md` — mục "Quick commands" và "Commits": quy ước commit cho agent.

## Tài liệu

- Husky: <https://typicode.github.io/husky>
- commitlint: <https://commitlint.js.org>