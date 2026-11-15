// 서버와 클라이언트가 주고받는 소켓 이벤트의 이름과 페이로드 타입.
// 양쪽이 이 파일 하나를 import하므로 이벤트 이름 오타나 필드 불일치는 컴파일 에러가 된다.
// 단, 클라이언트가 보낸 값은 타입과 다를 수 있으므로 서버는 zod 스키마로 다시 검사한다.
import type { PublicUser } from './auth.ts';
import type { Stroke } from './drawing.ts';
import type { PublicGameEvent } from './game.ts';
import type { Ack, ChatMessage, CreateRoomInput, JoinRoomInput, LobbyState, RoomView } from './rooms.ts';

export interface ServerToClientEvents {
  hello: (payload: { serverTime: number; user: PublicUser }) => void;
  // 같은 계정이 다른 곳에서 접속해 이 연결이 끊긴다.
  'session:replaced': () => void;
  'lobby:state': (state: LobbyState) => void;
  'lobby:chat': (message: ChatMessage) => void;
  'room:state': (room: RoomView) => void;
  'room:chat': (message: ChatMessage) => void;
  'game:event': (event: PublicGameEvent) => void;
  // 출제자에게만 간다.
  'round:word': (payload: { round: number; word: string }) => void;
  'draw:stroke': (stroke: Stroke) => void;
  'draw:clear': () => void;
  // 라운드 도중 들어온 사람에게 지금까지 그린 획을 한 번에 보낸다.
  'draw:sync': (strokes: Stroke[]) => void;
}

export interface ClientToServerEvents {
  'lobby:chat': (text: string) => void;
  'room:create': (input: CreateRoomInput, ack: (res: Ack<RoomView>) => void) => void;
  'room:join': (input: JoinRoomInput, ack: (res: Ack<RoomView>) => void) => void;
  'room:leave': (ack: (res: Ack) => void) => void;
  'room:chat': (text: string, ack: (res: Ack) => void) => void;
  'room:ready': (ready: boolean, ack: (res: Ack) => void) => void;
  'draw:stroke': (stroke: Stroke) => void;
  'draw:clear': () => void;
}
