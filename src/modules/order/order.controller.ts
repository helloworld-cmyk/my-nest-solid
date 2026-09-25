import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guard/jwt.guard.js';
import { CreateOrderRequestDto } from './dto/request/create-order.js';
import { ListOrdersQueryDto } from './dto/request/list-orders.query.js';
import {
  OrderListResponseDto,
  OrderResponseDto,
} from './dto/response/order.js';
import { OrderService } from './order.service.js';

@ApiTags('orders')
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create an order from the current cart' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Order created, returns the order with snapshotted items',
    type: OrderResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Cart is empty or payment, coupon, or stock is invalid',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - invalid or missing token',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Address, payment card, or coupon not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Idempotency key was already used',
  })
  createOrder(
    @Request() req: { user: { id: string } },
    @Body() dto: CreateOrderRequestDto,
  ) {
    return this.orderService.createOrder(req.user.id, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get paginated orders of the current user' })
  @ApiResponse({
    status: 200,
    description: 'Paginated user orders (newest first)',
    type: OrderListResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid pagination or filter query',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - invalid or missing token',
  })
  listOrders(
    @Request() req: { user: { id: string } },
    @Query() query: ListOrdersQueryDto,
  ) {
    return this.orderService.listOrders(req.user.id, query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get an order of the current user' })
  @ApiParam({ name: 'id', description: 'Order ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Order detail with snapshotted items',
    type: OrderResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid order ID',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - invalid or missing token',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Order not found',
  })
  getOrder(
    @Request() req: { user: { id: string } },
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.orderService.getOrder(req.user.id, id);
  }

  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel an order of the current user' })
  @ApiParam({ name: 'id', description: 'Order ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Order cancelled, returns the updated order',
    type: OrderResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid order ID',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - invalid or missing token',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Order not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Order can no longer be cancelled',
  })
  cancelOrder(
    @Request() req: { user: { id: string } },
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.orderService.cancelOrder(req.user.id, id);
  }
}
