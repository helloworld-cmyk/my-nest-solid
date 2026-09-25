import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guard/jwt.guard.js';
import { PaymentService } from './payment.service.js';
import { CreatePaymentCardRequestDto } from './dto/request/create-payment-card.js';
import { UpdatePaymentCardRequestDto } from './dto/request/update-payment-card.js';
import { PaymentCardResponseDto } from './dto/response/payment-card.js';

@ApiTags('payment')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payment cards of the current user' })
  @ApiResponse({
    status: 200,
    description: 'List of payment cards (default card first)',
    type: PaymentCardResponseDto,
    isArray: true,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  listCards(@Request() req: { user: { id: string } }) {
    return this.paymentService.listCards(req.user.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a payment card' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Payment card added successfully',
    type: PaymentCardResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - invalid or missing token',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Conflict - this card is already added',
  })
  addCard(
    @Request() req: { user: { id: string } },
    @Body() dto: CreatePaymentCardRequestDto,
  ) {
    return this.paymentService.addCard(req.user.id, dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a payment card' })
  @ApiResponse({
    status: 200,
    description: 'Payment card updated successfully',
    type: PaymentCardResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Payment card not found',
  })
  updateCard(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
    @Body() dto: UpdatePaymentCardRequestDto,
  ) {
    return this.paymentService.updateCard(req.user.id, id, dto);
  }

  @Patch(':id/default')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Set a payment card as the default' })
  @ApiResponse({
    status: 200,
    description: 'Payment card set as default',
    type: PaymentCardResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Payment card not found',
  })
  setDefaultCard(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
  ) {
    return this.paymentService.setDefaultCard(req.user.id, id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a payment card' })
  @ApiResponse({
    status: 200,
    description: 'Payment card deleted successfully',
    type: PaymentCardResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Payment card not found',
  })
  deleteCard(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
  ) {
    return this.paymentService.deleteCard(req.user.id, id);
  }
}
