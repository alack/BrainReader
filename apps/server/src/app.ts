import Fastify from 'fastify';
import fastifyCookie from '@fastify/cookie';
import { Server } from 'socket.io';
import type { Db } from './db.ts';
import { Presence } from './presence.ts';
import { SESSION_COOKIE, registerAuthRoutes } from './auth/routes.ts';
import { findSessionUser } from './auth/store.ts';
import { pickRandomWord } from './game/words.ts';
import { RoomManager, type RoomTiming } from './rooms/room-manager.ts';
import { registerRoomHandlers } from './rooms/handlers.ts';
import { createGameRunner } from './rooms/game-runner.ts';
import type { AppServer } from './socket-types.ts';

export interface AppDeps {
  db: Db;
  logger?: boolean;
  pickWord?: () => string;
  timing?: RoomTiming; // 테스트에서 라운드 시간을 줄일 때만 넘긴다
}

// 서버 구성 요소를 만들어 돌려주기만 한다. listen은 진입점(index.ts)이 한다.
// 라우트와 소켓 핸들러가 필요한 것(db, presence, rooms, runner)은 여기서 인자로 넘긴다.
export function buildApp({ db, logger = true, pickWord = pickRandomWord, timing }: AppDeps) {
  const fastify = Fastify({ logger });
  fastify.register(fastifyCookie);

  const io: AppServer = new Server(fastify.server);
  const presence = new Presence();
  const rooms = new RoomManager(pickWord, timing);
  const runner = createGameRunner({ io, rooms, presence });

  fastify.get('/api/health', async () => ({ ok: true }));
  registerAuthRoutes(fastify, db, presence);

  // 연결을 받기 전에 세션 쿠키로 유저를 확인한다. 로그인하지 않은 연결은 여기서 거절된다.
  io.use((socket, next) => {
    const token = fastifyCookie.parse(socket.request.headers.cookie ?? '')[SESSION_COOKIE];
    const user = token ? findSessionUser(db, token, Date.now()) : null;
    if (!user) return next(new Error('unauthorized'));
    socket.data.user = user;
    next();
  });

  io.on('connection', (socket) => {
    const { user } = socket.data;
    presence.connect(user.id, socket);
    socket.emit('hello', { serverTime: Date.now(), user });
    registerRoomHandlers(socket, { io, rooms, presence, runner, log: fastify.log });
  });

  return { fastify, io, rooms };
}
