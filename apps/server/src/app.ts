import Fastify from 'fastify';
import { Server } from 'socket.io';
import type { ClientToServerEvents, ServerToClientEvents } from '@brainreader/shared';

// 서버 구성 요소를 만들어 돌려주기만 한다. listen은 진입점(index.ts)이 한다.
// 라우트와 소켓 핸들러가 필요한 것은 여기서 인자로 넘긴다.
export function buildApp() {
  const fastify = Fastify({ logger: true });
  const io = new Server<ClientToServerEvents, ServerToClientEvents>(fastify.server);

  fastify.get('/api/health', async () => ({ ok: true }));

  io.on('connection', (socket) => {
    socket.emit('hello', { serverTime: Date.now() });

    socket.on('ping', (ack) => {
      ack({ serverTime: Date.now() });
    });
  });

  return { fastify, io };
}
