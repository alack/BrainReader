import type { FastifyInstance, FastifyReply } from 'fastify';
import { hash, verify } from '@node-rs/argon2';
import { credentialsSchema } from '@brainreader/shared';
import type { Db } from '../db.ts';
import type { Presence } from '../presence.ts';
import {
  SESSION_TTL_MS,
  createSession,
  deleteSession,
  findSessionUser,
  findUserForLogin,
  insertUser,
  toPublicUser,
} from './store.ts';

export const SESSION_COOKIE = 'sid';

export function registerAuthRoutes(fastify: FastifyInstance, db: Db, presence: Presence) {
  const startSession = (reply: FastifyReply, userId: string) => {
    const token = createSession(db, userId, Date.now());
    reply.setCookie(SESSION_COOKIE, token, {
      path: '/',
      httpOnly: true, // 페이지의 자바스크립트가 쿠키를 읽을 수 없다
      sameSite: 'lax', // 다른 사이트에서 보낸 POST에는 쿠키가 붙지 않는다
      secure: process.env.NODE_ENV === 'production',
      maxAge: SESSION_TTL_MS / 1000,
    });
  };

  fastify.post('/api/auth/register', async (request, reply) => {
    const parsed = credentialsSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: 'invalidInput', issues: parsed.error.issues });

    const { username, password } = parsed.data;
    const user = insertUser(db, username, await hash(password), Date.now());
    if (!user) return reply.code(409).send({ error: 'usernameTaken' });

    startSession(reply, user.id);
    return reply.code(201).send({ user });
  });

  fastify.post('/api/auth/login', async (request, reply) => {
    const parsed = credentialsSchema.safeParse(request.body);
    // 형식 오류도, 없는 아이디도, 틀린 비밀번호도 같은 응답이다.
    // 응답이 다르면 어떤 아이디가 가입돼 있는지 알아낼 수 있다.
    if (!parsed.success) return reply.code(401).send({ error: 'invalidCredentials' });

    const row = findUserForLogin(db, parsed.data.username);
    if (!row || !(await verify(row.password_hash, parsed.data.password))) {
      return reply.code(401).send({ error: 'invalidCredentials' });
    }

    const user = toPublicUser(row);
    startSession(reply, user.id);
    return { user };
  });

  fastify.post('/api/auth/logout', async (request, reply) => {
    const token = request.cookies[SESSION_COOKIE];
    if (token) {
      const user = findSessionUser(db, token, Date.now());
      deleteSession(db, token);
      if (user) presence.disconnect(user.id);
    }
    reply.clearCookie(SESSION_COOKIE, { path: '/' });
    return reply.code(204).send();
  });

  fastify.get('/api/auth/me', async (request, reply) => {
    const token = request.cookies[SESSION_COOKIE];
    const user = token ? findSessionUser(db, token, Date.now()) : null;
    if (!user) return reply.code(401).send({ error: 'unauthorized' });
    return { user };
  });
}
