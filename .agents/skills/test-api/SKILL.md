---
name: test-api
description: Test the NestJS API endpoints (register, login, refresh-token) using pre-saved test credentials and curl. Use when asked to test the API, run curl requests, or verify the auth flow.
license: MIT
metadata:
  author: local
  version: "1.0.0"
---

# Test API

Skill hướng dẫn test API của dự án `my-nest-solid` bằng curl.

## Test account mặc định (lưu sẵn)

Account test này đã được tạo sẵn trong database:

| Field       | Value             |
| ----------- | ----------------- |
| Email       | `test@example.com` |
| Password    | `123456`          |
| First name  | `Test`            |
| Last name   | `User`            |
| Phone       | `+84900000001`    |

> Nếu account chưa tồn tại (login trả `401`), hãy register với đúng email/password trên trước khi test.

## Endpoints

| Method | URL                                | Mô tả           |
| ------ | ---------------------------------- | --------------- |
| POST   | `http://localhost:3000/auth/register`  | Đăng ký user    |
| POST   | `http://localhost:3000/auth/login`     | Đăng nhập       |
| POST   | `http://localhost:3000/auth/refresh-token` | Refresh token |

- Server chạy trên `PORT` (mặc định `3000`), Swagger tại `http://localhost:3000/api-docs`
- Mọi response đều được bọc bởi `ResponseInterceptor`:
  ```json
  { "code": 200, "data": { ... }, "message": "Success" }
  ```
  Token nằm trong `data.accessToken` / `data.refreshToken`

## Cách test

### 1. Đăng ký (chỉ khi account test chưa tồn tại)

```bash
curl -s -X POST http://localhost:3000/auth/register \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "test@example.com",
    "password": "123456",
    "firstName": "Test",
    "lastName": "User",
    "phone": "+84900000001"
  }'
```

- `201` → đăng ký thành công
- `409` → email đã tồn tại (account test có sẵn), bỏ qua, sang login

### 2. Login và lưu token

```bash
curl -s -X POST http://localhost:3000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email": "test@example.com", "password": "123456"}' \
  | tee /tmp/api-tokens.json
```

Lưu token vào biến (tái sử dụng trong các request sau):

```bash
ACCESS_TOKEN=$(cat /tmp/api-tokens.json | python3 -c 'import sys,json;print(json.load(sys.stdin)["data"]["accessToken"])')
REFRESH_TOKEN=$(cat /tmp/api-tokens.json | python3 -c 'import sys,json;print(json.load(sys.stdin)["data"]["refreshToken"])')
```

### 3. Test endpoint yêu cầu auth (ví dụ)

```bash
curl -s http://localhost:3000/your-protected-route \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

### 4. Refresh token

```bash
curl -s -X POST http://localhost:3000/auth/refresh-token \
  -H 'Content-Type: application/json' \
  -d "{\"refreshToken\": \"$REFRESH_TOKEN\"}"
```

## Lưu ý

- `register` yêu cầu `password` tối thiểu 6 ký tự, `email` hợp lệ (class-validator)
- `refresh-token` với token sai/expired trả `401`
- Login sai mật khẩu trả `401` `Invalid credentials`
- Không đọc `.env`; biến môi trường tham khảo ở `.env.example`