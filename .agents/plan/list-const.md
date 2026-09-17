Trong my-nest-solid mình quét kiểu export const X = {...} / as const / enum / Record<>, kết quả (đã bỏ các chỗ dùng type của Prisma):

3. Const UPPER_CASE đơn lẻ (magic value đặt tên):
- src/socket/socket-auth.service.ts:8: USER_ROOM_PREFIX = 'user:'
- src/modules/test-socket/test-socket.gateway.ts:25: TEST_SOCKET_NAMESPACE = SOCKET_NAMESPACES.TEST
- src/modules/product/product.service.ts:23-24: RELATED_LIMIT = 4, HOME_PRODUCTS_SIZE = 10 (không export)
4. Array as const dùng như enum:
- src/modules/product/dto/request/list-products.query.ts:22: PRODUCT_LIST_SORTS = ['newest','price_asc',...] as const