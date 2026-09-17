import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { CounterService } from './counter.service.js';
import {
  COUNTER_INCREMENT_EVENT,
  COUNTER_NUMBER_EVENT,
  COUNTER_START_EVENT,
  COUNTER_STATE_EVENT,
  COUNTER_STOP_EVENT,
} from '../../utils/const/index.js';
import { CounterStreamDto } from './dto/response/counter-stream.js';
import { SetIncrementDto } from './dto/request/set-increment.js';
import { StartStreamDto } from './dto/request/start-stream.js';

const COUNTER_NAMESPACE = 'counter';
const COUNTER_CORS_OPTIONS = { origin: '*' };

@WebSocketGateway({
  namespace: COUNTER_NAMESPACE,
  cors: COUNTER_CORS_OPTIONS,
})
export class CounterGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(CounterGateway.name);

  constructor(private readonly counterService: CounterService) {}

  handleConnection(client: Socket): void {
    const snapshot = this.startStream(client);
    this.logger.log(
      `Client connected: "${client.id}" (${snapshot.step} per tick)`,
    );
  }

  handleDisconnect(client: Socket): void {
    this.counterService.remove(client.id);
    this.logger.log(`Client disconnected: "${client.id}"`);
  }

  @SubscribeMessage(COUNTER_INCREMENT_EVENT)
  handleIncrement(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: number | SetIncrementDto,
  ): void {
    const dto = SetIncrementDto.parse(payload);
    const snapshot = this.counterService.setIncrement(
      client.id,
      dto.step,
      dto.startFrom,
    );
    client.emit(COUNTER_STATE_EVENT, snapshot);
  }

  @SubscribeMessage(COUNTER_START_EVENT)
  handleStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: unknown,
  ): void {
    const dto = StartStreamDto.parse(payload);
    this.startStream(client, dto.startFrom);
  }

  @SubscribeMessage(COUNTER_STOP_EVENT)
  handleStop(@ConnectedSocket() client: Socket): void {
    const snapshot = this.counterService.stop(client.id);
    if (snapshot) {
      client.emit(COUNTER_STATE_EVENT, snapshot);
    }
  }

  private startStream(client: Socket, startFrom?: number): CounterStreamDto {
    const snapshot = this.counterService.start(client.id, {
      emit: (value) => client.emit(COUNTER_NUMBER_EVENT, value),
      startFrom,
    });
    client.emit(COUNTER_STATE_EVENT, snapshot);

    return snapshot;
  }
}
