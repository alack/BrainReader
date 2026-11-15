import type { Server, Socket } from 'socket.io';
import type { ClientToServerEvents, PublicUser, ServerToClientEvents } from '@brainreader/shared';

export interface SocketData {
  // 연결 시점에 세션으로 확인한 유저. 클라이언트가 보낸 이름은 믿지 않는다.
  user: PublicUser;
  // 들어가 있는 방. 대기실에 있으면 없다.
  roomId?: string;
}

export type AppServer = Server<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>;
export type AppSocket = Socket<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>;
