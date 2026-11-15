import type { Server, Socket } from 'socket.io';
import type { ClientToServerEvents, PublicUser, ServerToClientEvents } from '@brainreader/shared';

// 연결 시점에 세션으로 확인한 유저. 클라이언트가 보낸 이름은 믿지 않는다.
export interface SocketData {
  user: PublicUser;
}

export type AppServer = Server<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>;
export type AppSocket = Socket<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>;
