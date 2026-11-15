import { io, type Socket } from 'socket.io-client';
import type { ClientToServerEvents, ServerToClientEvents } from '@brainreader/shared';

// 주소를 넘기지 않으면 페이지를 연 출처로 연결한다.
// 앱 전체에서 소켓 하나만 쓴다.
export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io({
  autoConnect: false,
});

// 서버 시계와 이 브라우저 시계의 차이. 라운드 마감 시각(endsAt)은 서버 시계 기준이다.
// 접속할 때 받은 serverTime으로 맞춘다 (네트워크 지연만큼의 오차는 남는다).
export const clock = {
  offsetMs: 0,
  serverNow: () => Date.now() + clock.offsetMs,
};
