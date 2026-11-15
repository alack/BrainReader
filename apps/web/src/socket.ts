import { io, type Socket } from 'socket.io-client';
import type { ClientToServerEvents, ServerToClientEvents } from '@brainreader/shared';

// 주소를 넘기지 않으면 페이지를 연 출처로 연결한다.
// 앱 전체에서 소켓 하나만 쓴다.
export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io({
  autoConnect: false,
});
