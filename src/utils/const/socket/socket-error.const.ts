import { WsException } from '@nestjs/websockets';

export enum SocketErrorCode {
  UnknownError = 1000,
  // client payload errors (1xxx)
  InvalidPayload = 1001,
  RoomRequired = 1002,
  MessageRequired = 1003,
  // auth errors (2xxx)
  NotAuthenticated = 2001,
  Forbidden = 2002,
  AuthenticationFailed = 2003,
  // state errors (3xxx)
  NotFound = 3001,
  Conflict = 3002,
  // RateLimited = 3003,
  // server errors (9xxx)
  InternalError = 9001,
}

export const SOCKET_ERROR_DEFAULT_MESSAGES: Record<SocketErrorCode, string> = {
  [SocketErrorCode.UnknownError]: 'Unknown socket error',
  [SocketErrorCode.InvalidPayload]: 'Invalid payload',
  [SocketErrorCode.RoomRequired]: 'Room must be a non-empty string',
  [SocketErrorCode.MessageRequired]: 'Message must be a non-empty string',
  [SocketErrorCode.NotAuthenticated]: 'Socket is not authenticated',
  [SocketErrorCode.AuthenticationFailed]: 'Authentication failed',
  [SocketErrorCode.Forbidden]: 'Action is not allowed',
  [SocketErrorCode.NotFound]: 'Resource was not found',
  [SocketErrorCode.Conflict]: 'Resource already exists',
  // [SocketErrorCode.RateLimited]: 'Too many requests, slow down',
  [SocketErrorCode.InternalError]: 'Internal server error',
};

export class SocketException extends WsException {
  readonly code: SocketErrorCode;
  readonly reason: string;

  constructor(code: SocketErrorCode, message?: string) {
    const reason = message ?? SOCKET_ERROR_DEFAULT_MESSAGES[code];
    super({ code, message: reason });
    this.code = code;
    this.reason = reason;
  }
}

export interface SocketErrorPayload {
  code: SocketErrorCode;
  message: string;
  event: string | null;
  timestamp: Date;
}
