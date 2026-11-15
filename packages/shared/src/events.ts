// 서버와 클라이언트가 주고받는 소켓 이벤트의 이름과 페이로드 타입.
// 양쪽이 이 파일 하나를 import하므로 이벤트 이름 오타나 필드 불일치는 컴파일 에러가 된다.
import type { PublicUser } from './auth.ts';

export interface ServerToClientEvents {
  hello: (payload: { serverTime: number; user: PublicUser }) => void;
  // 같은 계정이 다른 곳에서 접속해 이 연결이 끊긴다.
  'session:replaced': () => void;
}

export interface ClientToServerEvents {
  ping: (ack: (payload: { serverTime: number }) => void) => void;
}
