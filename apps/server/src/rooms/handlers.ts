import type { FastifyBaseLogger } from 'fastify';
import { z } from 'zod';
import { hash, verify } from '@node-rs/argon2';
import { chatTextSchema, createRoomSchema, joinRoomSchema, strokeSchema, type Ack } from '@brainreader/shared';
import { GameError, type GameEvent } from '../game/game.ts';
import type { Presence } from '../presence.ts';
import type { AppServer, AppSocket } from '../socket-types.ts';
import { roomChannel, type GameRunner } from './game-runner.ts';
import type { Room, RoomManager } from './room-manager.ts';

export const LOBBY = 'lobby';

// 한 라운드에 보관하는 획 조각 수 상한. 악의적인 클라이언트가 서버 메모리를 채우지 못하게 한다.
const MAX_STROKES_PER_ROUND = 4_000;

export interface RoomHandlerDeps {
  io: AppServer;
  rooms: RoomManager;
  presence: Presence;
  runner: GameRunner;
  log: FastifyBaseLogger;
}

export function registerRoomHandlers(socket: AppSocket, { io, rooms, presence, runner, log }: RoomHandlerDeps) {
  const { user } = socket.data;

  // 핸들러 안에서 난 예외는 여기서 잡는다.
  // 2017년에는 핸들러 하나의 예외(S1)가 서버 프로세스 전체를 죽였다.
  const guard =
    <A extends unknown[]>(fn: (...args: A) => unknown) =>
    async (...args: A) => {
      try {
        await fn(...args);
      } catch (err) {
        log.error({ err, userId: user.id }, 'socket handler failed');
      }
    };

  const broadcastLobby = () => {
    io.to(LOBBY).emit('lobby:state', { rooms: rooms.summaries(), users: presence.users() });
  };

  const currentRoom = () => (socket.data.roomId ? rooms.get(socket.data.roomId) : undefined);

  // 게임 규칙 위반(GameError)은 요청한 사람에게 이유를 돌려주고, 그 밖의 예외는 guard로 넘긴다.
  const play = (reply: (res: Ack) => void, room: Room, action: () => GameEvent[]) => {
    let events: GameEvent[];
    try {
      events = action();
    } catch (err) {
      if (err instanceof GameError) return reply({ ok: false, error: err.code });
      throw err;
    }
    runner.apply(room, events);
    reply({ ok: true, data: undefined });
  };

  const enter = (room: Room) => {
    room.game.addPlayer(user.id, user.username); // 정원 초과면 GameError('roomFull')
    socket.data.roomId = room.id;
    socket.leave(LOBBY);
    socket.join(roomChannel(room.id));
    if (room.strokes.length > 0) socket.emit('draw:sync', room.strokes);
    runner.emitRoomState(room);
    broadcastLobby();
    return rooms.view(room);
  };

  const leave = () => {
    const room = currentRoom();
    const roomId = socket.data.roomId;
    if (!roomId) return;
    delete socket.data.roomId;
    socket.leave(roomChannel(roomId));
    socket.join(LOBBY);
    if (!room) return;

    runner.apply(room, room.game.removePlayer(user.id, Date.now()));
    if (room.game.snapshot().players.length === 0) rooms.delete(room.id);
    else runner.emitRoomState(room);
  };

  socket.join(LOBBY);
  broadcastLobby();

  socket.on(
    'lobby:chat',
    guard((text) => {
      if (socket.data.roomId) return;
      const parsed = chatTextSchema.safeParse(text);
      if (!parsed.success) return;
      io.to(LOBBY).emit('lobby:chat', {
        userId: user.id,
        username: user.username,
        text: parsed.data,
        sentAt: Date.now(),
      });
    }),
  );

  socket.on(
    'room:create',
    guard(async (input, ack) => {
      const reply = replier(ack);
      if (socket.data.roomId) return reply({ ok: false, error: 'alreadyInRoom' });
      const parsed = createRoomSchema.safeParse(input);
      if (!parsed.success) return reply({ ok: false, error: 'invalidInput' });

      const { password, ...settings } = parsed.data;
      const room = rooms.create({ ...settings, passwordHash: password ? await hash(password) : null });
      reply({ ok: true, data: enter(room) });
    }),
  );

  socket.on(
    'room:join',
    guard(async (input, ack) => {
      const reply = replier(ack);
      if (socket.data.roomId) return reply({ ok: false, error: 'alreadyInRoom' });
      const parsed = joinRoomSchema.safeParse(input);
      if (!parsed.success) return reply({ ok: false, error: 'invalidInput' });

      const room = rooms.get(parsed.data.roomId);
      if (!room) return reply({ ok: false, error: 'roomNotFound' });
      // 비밀번호는 서버에서만 비교한다. 클라이언트는 방 비밀번호를 받지도 않는다 (REVIEW S10, S11).
      if (room.passwordHash && !(await verify(room.passwordHash, parsed.data.password ?? ''))) {
        return reply({ ok: false, error: 'wrongPassword' });
      }
      // 비밀번호를 확인하는 사이에 방이 사라졌거나 다른 방에 들어갔을 수 있다.
      if (!rooms.get(room.id)) return reply({ ok: false, error: 'roomNotFound' });
      if (socket.data.roomId) return reply({ ok: false, error: 'alreadyInRoom' });

      try {
        reply({ ok: true, data: enter(room) });
      } catch (err) {
        if (err instanceof GameError) return reply({ ok: false, error: err.code });
        throw err;
      }
    }),
  );

  socket.on(
    'room:leave',
    guard((ack) => {
      leave();
      broadcastLobby();
      replier(ack)({ ok: true, data: undefined });
    }),
  );

  socket.on(
    'room:chat',
    guard((text, ack) => {
      const reply = replier(ack);
      const room = currentRoom();
      if (!room) return reply({ ok: false, error: 'notInRoom' });
      const parsed = chatTextSchema.safeParse(text);
      if (!parsed.success) return reply({ ok: false, error: 'invalidInput' });
      play(reply, room, () => room.game.chat(user.id, parsed.data, Date.now()));
    }),
  );

  socket.on(
    'room:ready',
    guard((ready, ack) => {
      const reply = replier(ack);
      const room = currentRoom();
      if (!room) return reply({ ok: false, error: 'notInRoom' });
      const parsed = z.boolean().safeParse(ready);
      if (!parsed.success) return reply({ ok: false, error: 'invalidInput' });
      play(reply, room, () => room.game.setReady(user.id, parsed.data, Date.now()));
      // 준비 표시만 바뀌고 게임이 시작되지 않았어도 모두의 화면에 반영한다.
      runner.emitRoomState(room);
      broadcastLobby();
    }),
  );

  // 그리기는 지금 출제자만 할 수 있다. 검사는 서버에서 한다 (REVIEW S2, C8).
  socket.on(
    'draw:stroke',
    guard((stroke) => {
      const room = currentRoom();
      if (!room || room.game.currentDrawer() !== user.id) return;
      const parsed = strokeSchema.safeParse(stroke);
      if (!parsed.success || room.strokes.length >= MAX_STROKES_PER_ROUND) return;
      room.strokes.push(parsed.data);
      socket.to(roomChannel(room.id)).emit('draw:stroke', parsed.data); // 보낸 사람은 이미 그렸다
    }),
  );

  socket.on(
    'draw:clear',
    guard(() => {
      const room = currentRoom();
      if (!room || room.game.currentDrawer() !== user.id) return;
      room.strokes = [];
      socket.to(roomChannel(room.id)).emit('draw:clear');
    }),
  );

  socket.on(
    'disconnect',
    guard(() => {
      leave();
      presence.release(user.id, socket);
      broadcastLobby();
    }),
  );
}

// 클라이언트가 ack 함수를 안 넘겨도 서버가 죽지 않게 한다.
function replier<T>(ack: unknown): (res: Ack<T>) => void {
  return typeof ack === 'function' ? (ack as (res: Ack<T>) => void) : () => {};
}
