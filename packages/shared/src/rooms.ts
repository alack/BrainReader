import { z } from 'zod';
import type { GameSnapshot } from './game.ts';

export const createRoomSchema = z.object({
  name: z.string().trim().min(1, '방 이름을 입력하세요').max(20, '방 이름은 20자 이하'),
  // 빈 문자열은 비밀번호 없음으로 본다.
  password: z
    .string()
    .max(20, '비밀번호는 20자 이하')
    .optional()
    .transform((p) => (p ? p : undefined)),
  maxPlayers: z.number().int().min(2).max(8),
  rounds: z.number().int().min(1).max(10),
  roundTimeSec: z.number().int().min(30).max(180),
});
export type CreateRoomInput = z.input<typeof createRoomSchema>;

export const joinRoomSchema = z.object({
  roomId: z.string().min(1),
  password: z.string().max(20).optional(),
});
export type JoinRoomInput = z.infer<typeof joinRoomSchema>;

export const chatTextSchema = z.string().trim().min(1).max(200);

// 대기실 목록에 나가는 방 정보. 비밀번호는 있는지 여부(locked)만 알린다.
export interface RoomSummary {
  id: string;
  name: string;
  locked: boolean;
  playerCount: number;
  maxPlayers: number;
  playing: boolean;
}

// 방 안에 있는 사람에게 나가는 방 정보.
export interface RoomView {
  id: string;
  name: string;
  locked: boolean;
  maxPlayers: number;
  rounds: number;
  roundTimeSec: number;
  game: GameSnapshot;
}

export interface LobbyState {
  rooms: RoomSummary[];
  users: { id: string; username: string; roomId: string | null }[];
}

export interface ChatMessage {
  userId: string;
  username: string;
  text: string;
  sentAt: number;
}

// 요청에 대한 서버의 응답(ack). 실패하면 error에 이유 코드가 온다.
export type Ack<T = undefined> = { ok: true; data: T } | { ok: false; error: string };
