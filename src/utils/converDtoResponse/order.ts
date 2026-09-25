import type {
  OrderListItem,
  OrderWithItems,
} from '../../repositories/order.repository.js';
import type {
  OrderItemResponseDto,
  OrderListResponseDto,
  OrderResponseDto,
} from '../../modules/order/dto/response/order.js';
import { buildPaginationMeta } from '../pagination/index.js';

type OrderData = OrderWithItems | OrderListItem;
type OrderItemData = OrderData['items'][number];

export class OrderResponseMapper {
  private constructor() {}

  static toOrderItem(item: OrderItemData): OrderItemResponseDto {
    return {
      id: item.id,
      productId: item.productId,
      variantId: item.variantId,
      variantSku: item.variantSku,
      name: item.name,
      imagePath: item.imagePath,
      colorHexCode: item.colorHexCode,
      size: item.size,
      unitPrice: Number(item.unitPrice),
      quantity: item.quantity,
      lineTotal: Number(item.lineTotal),
      createdAt: item.createdAt,
    };
  }

  static toOrderItems(items: OrderItemData[]): OrderItemResponseDto[] {
    return items.map((item) => OrderResponseMapper.toOrderItem(item));
  }

  static toOrderResponse(order: OrderData): OrderResponseDto {
    return {
      id: order.id,
      userId: order.userId,
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      paymentCardId: order.paymentCardId,
      paymentCardLast4: order.paymentCardLast4,
      paymentCardBrand: order.paymentCardBrand,
      addressId: order.addressId,
      addressSnapshot:
        order.addressSnapshot as unknown as OrderResponseDto['addressSnapshot'],
      subtotal: Number(order.subtotal),
      discount: Number(order.discount),
      shippingFee: Number(order.shippingFee),
      totalAmount: Number(order.totalAmount),
      couponCode: order.couponCode,
      idempotencyKey: order.idempotencyKey,
      note: order.note,
      items: OrderResponseMapper.toOrderItems(order.items),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }

  static toOrderResponses(orders: OrderData[]): OrderResponseDto[] {
    return orders.map((order) => OrderResponseMapper.toOrderResponse(order));
  }

  static toOrderListResponse(
    items: OrderData[],
    page: number,
    limit: number,
    total: number,
  ): OrderListResponseDto {
    return {
      items: OrderResponseMapper.toOrderResponses(items),
      pagination: buildPaginationMeta(page, limit, total),
    };
  }
}
