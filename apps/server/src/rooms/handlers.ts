import type { FastifyBaseLogger } from 'fastify';
import { hash, verify } from '@node-rs/argon2';
import { chatTextSchema, createRoomSchema, joinRoomSchema, type Ack } from '@brainreader/shared';
import { GameError } from '../game/game.ts';
import type { Presence } from '../presence.ts';
import type { AppServer, AppSocket } from '../socket-types.ts';
import type { Room, RoomManager } from './room-manager.ts';

export const LOBBY = 'lobby';
const channel = (roomId: string) => `room:${roomId}`;

export interface RoomHandlerDeps {
  io: AppServer;
  rooms: RoomManager;
  presence: Presence;
  log: FastifyBaseLogger;
}

export function registerRoomHandlers(socket: AppSocket, { io, rooms, presence, log }: RoomHandlerDeps) {
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
  const emitRoomState = (room: Room) => {
    io.to(channel(room.id)).emit('room:state', rooms.view(room));
  };

  const enter = (room: Room) => {
    room.game.addPlayer(user.id, user.username); // 정원 초과면 GameError('roomFull')
    socket.data.roomId = room.id;
    socket.leave(LOBBY);
    socket.join(channel(room.id));
    emitRoomState(room);
    broadcastLobby();
    return rooms.view(room);
  };

  const leave = () => {
    const roomId = socket.data.roomId;
    if (!roomId) return;
    delete socket.data.roomId;
    socket.leave(channel(roomId));
    socket.join(LOBBY);

    const room = rooms.get(roomId);
    if (!room) return;
    room.game.removePlayer(user.id, Date.now());
    if (room.game.snapshot().players.length === 0) rooms.delete(room.id);
    else emitRoomState(room);
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
      const room = socket.data.roomId ? rooms.get(socket.data.roomId) : undefined;
      if (!room) return reply({ ok: false, error: 'notInRoom' });
      const parsed = chatTextSchema.safeParse(text);
      if (!parsed.success) return reply({ ok: false, error: 'invalidInput' });

      let events;
      try {
        events = room.game.chat(user.id, parsed.data, Date.now());
      } catch (err) {
        if (err instanceof GameError) return reply({ ok: false, error: err.code });
        throw err;
      }
      for (const event of events) {
        if (event.type === 'chat') {
          io.to(channel(room.id)).emit('room:chat', {
            userId: user.id,
            username: user.username,
            text: event.text,
            sentAt: Date.now(),
          });
        }
        // 정답, 라운드 진행 같은 나머지 게임 이벤트는 v0.06에서 게임 화면과 함께 연결한다.
      }
      reply({ ok: true, data: undefined });
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
