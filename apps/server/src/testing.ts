// 소켓 통합 테스트용 도우미. 테스트에서만 import한다.
import type { AddressInfo } from 'node:net';
import { afterEach } from 'vitest';
import { io as connect, type Socket } from 'socket.io-client';
import type { ClientToServerEvents, LobbyState, ServerToClientEvents } from '@brainreader/shared';
import { buildApp, type AppDeps } from './app.ts';
import { openDb } from './db.ts';

export type Client = Socket<ServerToClientEvents, ClientToServerEvents>;
type App = ReturnType<typeof buildApp>;

const apps: App[] = [];
const clients: Client[] = [];

afterEach(async () => {
  for (const c of clients.splice(0)) c.disconnect();
  for (const app of apps.splice(0)) {
    app.io.close();
    await app.fastify.close();
  }
});

export async function startServer(deps: Partial<AppDeps> = {}) {
  const app = buildApp({ db: openDb(':memory:'), logger: false, pickWord: () => '사과', ...deps });
  apps.push(app);
  await app.fastify.listen({ port: 0, host: '127.0.0.1' });
  const url = `http://127.0.0.1:${(app.fastify.server.address() as AddressInfo).port}`;

  // 가입하고 그 세션으로 소켓을 연다. 대기실 상태를 한 번 받을 때까지 기다린다.
  const login = async (username: string) => {
    const res = await app.fastify.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: { username, password: 'password123' },
    });
    const token = res.cookies.find((c) => c.name === 'sid')!.value;
    const client: Client = connect(url, {
      transports: ['websocket'],
      reconnection: false,
      extraHeaders: { cookie: `sid=${token}` },
    });
    clients.push(client);
    await next(client, 'lobby:state');
    return client;
  };
  return { app, login };
}

type Payload<E extends keyof ServerToClientEvents> = Parameters<ServerToClientEvents[E]>[0];

export function next<E extends keyof ServerToClientEvents>(client: Client, event: E) {
  return new Promise<Payload<E>>((resolve) => {
    client.once(event, ((arg: Payload<E>) => resolve(arg)) as never);
  });
}

// 조건에 맞는 이벤트가 올 때까지 기다린다.
export function nextWhere<E extends keyof ServerToClientEvents>(
  client: Client,
  event: E,
  check: (payload: Payload<E>) => boolean,
) {
  return new Promise<Payload<E>>((resolve) => {
    const listener = ((payload: Payload<E>) => {
      if (!check(payload)) return;
      client.off(event, listener as never);
      resolve(payload);
    }) as never;
    client.on(event, listener);
  });
}

export const lobbyWhere = (client: Client, check: (s: LobbyState) => boolean) => nextWhere(client, 'lobby:state', check);

// 이벤트가 오지 않는다는 것을 확인할 때 쓴다. ms 동안 받은 것을 돌려준다.
export function collect<E extends keyof ServerToClientEvents>(client: Client, event: E, ms: number) {
  const got: Payload<E>[] = [];
  const listener = ((payload: Payload<E>) => got.push(payload)) as never;
  client.on(event, listener);
  return new Promise<Payload<E>[]>((resolve) =>
    setTimeout(() => {
      client.off(event, listener);
      resolve(got);
    }, ms),
  );
}
