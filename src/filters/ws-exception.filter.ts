import { ArgumentsHost, Catch } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import type { Socket } from 'socket.io';
import { SOCKET_EVENTS } from '../utils/const/socket/socket-event.const.js';
import {
  SocketErrorCode,
  SocketErrorPayload,
  SocketException,
} from '../utils/const/socket/socket-error.const.js';

@Catch()
export class WsExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    if (host.getType() !== 'ws') {
      return;
    }
    const ws = host.switchToWs();
    const socket = ws.getClient<Socket>();
    const event = ws.getPattern() ?? null;

    const { code, message } = this.resolveError(exception);
    const payload: SocketErrorPayload = {
      code,
      message,
      event,
      timestamp: new Date(),
    };
    socket.emit(SOCKET_EVENTS.EXCEPTION, payload);
  }

  private resolveError(exception: unknown): {
    code: SocketErrorCode;
    message: string;
  } {
    if (exception instanceof SocketException) {
      return { code: exception.code, message: exception.reason };
    }
    if (exception instanceof WsException) {
      const embedded = this.extractWsCode(exception);
      if (embedded) {
        return embedded;
      }
      return {
        code: SocketErrorCode.InvalidPayload,
        message: this.extractWsMessage(exception),
      };
    }
    if (exception instanceof Error) {
      return {
        code: SocketErrorCode.InternalError,
        message: 'Internal server error',
      };
    }
    return {
      code: SocketErrorCode.UnknownError,
      message: 'Unknown socket error',
    };
  }

  private extractWsMessage(exception: WsException): string {
    const error = exception.getError();
    return typeof error === 'string' ? error : JSON.stringify(error);
  }

  private extractWsCode(
    exception: WsException,
  ): { code: SocketErrorCode; message: string } | null {
    const error = exception.getError();
    if (typeof error !== 'object' || error === null) {
      return null;
    }
    const { code, message } = error as {
      code?: SocketErrorCode;
      message?: unknown;
    };
    if (typeof code !== 'number' || typeof message !== 'string') {
      return null;
    }
    return { code, message };
  }
}
