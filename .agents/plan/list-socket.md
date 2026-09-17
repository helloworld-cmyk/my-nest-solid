Các file liên quan đến socket:
Module test-socket (my-nest-solid/src/modules/test-socket/):
- test-socket.module.ts — khai báo module
- test-socket.gateway.ts — WebSocketGateway (xử lý connect/disconnect/events, emit) test-socket.gateway.ts:44
- test-socket.service.ts — service broadcast/emit/status
- test-socket.controller.ts — REST API để test socket test-socket.controller.ts:13
- dto/response/test-socket.dto.ts — DTO response
- dto/request/broadcast-message.dto.ts — DTO request
Cấu hình/đăng ký:
- my-nest-solid/src/app.module.ts:29 — đăng ký TestSocketModule
- my-nest-solid/package.json — deps socket.io, @nestjs/websockets, @nestjs/platform-socket.io

2. Cấu trúc thư mục điển hình:
src/socket/
├── socket.module.ts          // @Global() — export các thứ dùng chung
├── socket.options.ts         // config factory dùng chung
├── socket-auth.guard.ts      // JWT guard dùng chung cho ws
├── ws-exception.filter.ts    // filter lỗi riêng cho socket
├── socket-event.ts           // hằng số tên event dùng chung
├── socket-auth.service.ts    // map userId ↔ socketId, quản lý rooms
└── socket-emitter.ts         // service để HTTP layer emit (như testSocketService của bạn)

src/modules/chat/chat.gateway.ts       // namespace /chat
src/modules/notification/notification.gateway.ts  // namespace /notification