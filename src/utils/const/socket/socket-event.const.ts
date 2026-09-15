export const SOCKET_NAMESPACES = {
  TEST: '/test-socket',
} as const;

export const SOCKET_EVENTS = {
  EXCEPTION: 'exception',
  WELCOME: 'welcome',
  PING: 'ping',
  PONG: 'pong',
  JOIN_ROOM: 'join-room',
  LEAVE_ROOM: 'leave-room',
  JOINED_ROOM: 'joined-room',
  LEFT_ROOM: 'left-room',
  ROOM_NOTICE: 'room-notice',
  CHAT_MESSAGE: 'chat-message',
} as const;

export type SocketNamespace =
  (typeof SOCKET_NAMESPACES)[keyof typeof SOCKET_NAMESPACES];
export type SocketEvent = (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS];
