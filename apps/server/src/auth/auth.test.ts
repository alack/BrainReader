import type { AddressInfo } from 'node:net';
import { afterEach, describe, expect, it } from 'vitest';
import { io as connect, type Socket } from 'socket.io-client';
import { buildApp } from '../app.ts';
import { openDb } from '../db.ts';

type App = ReturnType<typeof buildApp> & { db: ReturnType<typeof openDb> };

const apps: App[] = [];
const sockets: Socket[] = [];

afterEach(async () => {
  for (const s of sockets.splice(0)) s.disconnect();
  for (const app of apps.splice(0)) {
    app.io.close();
    await app.fastify.close();
  }
});

function makeApp(): App {
  const db = openDb(':memory:');
  const app = { ...buildApp({ db, logger: false }), db };
  apps.push(app);
  return app;
}

const CREDS = { username: '지수', password: 'correct horse' };

async function register(app: App, body: object = CREDS) {
  return app.fastify.inject({ method: 'POST', url: '/api/auth/register', payload: body });
}

function sessionCookie(res: { cookies: { name: string; value: string }[] }) {
  const cookie = res.cookies.find((c) => c.name === 'sid');
  if (!cookie) throw new Error('세션 쿠키 없음');
  return cookie;
}

describe('회원가입과 로그인', () => {
  it('가입하면 세션 쿠키가 생기고, 응답에 비밀번호 관련 필드가 없다 (REVIEW X1)', async () => {
    const res = await register(makeApp());
    expect(res.statusCode).toBe(201);
    expect(res.json()).toEqual({ user: { id: '1', username: '지수' } });
    expect(res.body).not.toMatch(/password|hash/i);
    expect(sessionCookie(res)).toMatchObject({ httpOnly: true, sameSite: 'Lax' });
  });

  it('같은 아이디는 대소문자만 달라도 가입할 수 없다', async () => {
    const app = makeApp();
    await register(app, { username: 'Alack', password: 'password1' });
    const res = await register(app, { username: 'alack', password: 'password2' });
    expect(res.statusCode).toBe(409);
  });

  it('형식이 틀리면 400이다', async () => {
    const res = await register(makeApp(), { username: 'a', password: 'short' });
    expect(res.statusCode).toBe(400);
  });

  it('없는 아이디와 틀린 비밀번호는 같은 응답이다 (2017년에는 달라서 가입 여부가 드러났다)', async () => {
    const app = makeApp();
    await register(app);
    const login = (body: object) => app.fastify.inject({ method: 'POST', url: '/api/auth/login', payload: body });

    const wrongPassword = await login({ username: '지수', password: 'wrong password' });
    const unknownUser = await login({ username: '없는사람', password: 'wrong password' });
    expect(wrongPassword.statusCode).toBe(401);
    expect(unknownUser.statusCode).toBe(401);
    expect(wrongPassword.body).toBe(unknownUser.body);
  });

  it('맞는 비밀번호로 로그인하면 /me가 유저를 돌려주고, 로그아웃하면 401이 된다', async () => {
    const app = makeApp();
    await register(app);
    const login = await app.fastify.inject({ method: 'POST', url: '/api/auth/login', payload: CREDS });
    const cookies = { sid: sessionCookie(login).value };

    const me = await app.fastify.inject({ url: '/api/auth/me', cookies });
    expect(me.json()).toEqual({ user: { id: '1', username: '지수' } });

    await app.fastify.inject({ method: 'POST', url: '/api/auth/logout', cookies });
    const after = await app.fastify.inject({ url: '/api/auth/me', cookies });
    expect(after.statusCode).toBe(401);
  });

  it('DB에는 비밀번호 원문도 세션 토큰 원문도 저장하지 않는다', async () => {
    const app = makeApp();
    const token = sessionCookie(await register(app)).value;
    const dump = JSON.stringify([
      app.db.prepare('SELECT * FROM users').all(),
      app.db.prepare('SELECT * FROM sessions').all(),
    ]);
    expect(dump).not.toContain(CREDS.password);
    expect(dump).not.toContain(token);
  });
});

describe('소켓 인증', () => {
  async function listen(app: App) {
    await app.fastify.listen({ port: 0, host: '127.0.0.1' });
    return `http://127.0.0.1:${(app.fastify.server.address() as AddressInfo).port}`;
  }

  function open(url: string, token?: string) {
    const socket = connect(url, {
      transports: ['websocket'],
      reconnection: false,
      extraHeaders: token ? { cookie: `sid=${token}` } : {},
    });
    sockets.push(socket);
    return socket;
  }

  const once = <T>(socket: Socket, event: string) =>
    new Promise<T>((resolve) => socket.once(event, (arg: T) => resolve(arg)));

  it('로그인하지 않은 연결은 거절한다 (REVIEW X5)', async () => {
    const app = makeApp();
    const err = await once<Error>(open(await listen(app)), 'connect_error');
    expect(err.message).toBe('unauthorized');
  });

  it('세션 쿠키로 연결하면 서버가 확인한 유저 정보를 보낸다', async () => {
    const app = makeApp();
    const token = sessionCookie(await register(app)).value;
    const hello = await once<{ user: unknown }>(open(await listen(app), token), 'hello');
    expect(hello.user).toEqual({ id: '1', username: '지수' });
  });

  it('같은 계정이 새로 접속하면 이전 연결은 끊긴다 (REVIEW S13 대체)', async () => {
    const app = makeApp();
    const token = sessionCookie(await register(app)).value;
    const url = await listen(app);

    const first = open(url, token);
    await once(first, 'hello');
    const replaced = once(first, 'session:replaced');
    const disconnected = once(first, 'disconnect');

    const second = open(url, token);
    await once(second, 'hello');
    await replaced;
    await disconnected;
    expect(first.connected).toBe(false);
    expect(second.connected).toBe(true);
  });

  it('로그아웃하면 그 유저의 소켓도 끊긴다', async () => {
    const app = makeApp();
    const token = sessionCookie(await register(app)).value;
    const socket = open(await listen(app), token);
    await once(socket, 'hello');

    const disconnected = once(socket, 'disconnect');
    await app.fastify.inject({ method: 'POST', url: '/api/auth/logout', cookies: { sid: token } });
    await disconnected;
    expect(socket.connected).toBe(false);
  });
});
