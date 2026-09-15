export const SOCKET_CORS_OPTIONS = {
  origin: '*',
  credentials: true,
} as const;

export const MAX_SOCKET_PAYLOAD_BYTES = 1_000_000;

export interface SocketGatewayOptions {
  namespace: string;
  cors: typeof SOCKET_CORS_OPTIONS;
  maxHttpBufferSize: number;
}

export function socketGatewayOptions(namespace: string): SocketGatewayOptions {
  return {
    namespace,
    cors: SOCKET_CORS_OPTIONS,
    maxHttpBufferSize: MAX_SOCKET_PAYLOAD_BYTES,
  };
}
