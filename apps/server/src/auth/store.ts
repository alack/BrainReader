import { createHash, randomBytes } from 'node:crypto';
import type { PublicUser } from '@brainreader/shared';
import type { Db } from '../db.ts';

export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

interface UserRow {
  id: number;
  username: string;
  password_hash: string;
}

// DB 행을 그대로 내보내지 않고 공개해도 되는 칼럼만 골라 담는다.
export function toPublicUser(row: Pick<UserRow, 'id' | 'username'>): PublicUser {
  return { id: String(row.id), username: row.username };
}

// 값은 전부 ? 자리에 넘긴다. SQL 문자열에 사용자 입력을 이어 붙이지 않는다.
export function insertUser(db: Db, username: string, passwordHash: string, now: number): PublicUser | null {
  try {
    const row = db
      .prepare('INSERT INTO users (username, password_hash, created_at) VALUES (?, ?, ?) RETURNING id, username')
      .get(username, passwordHash, now) as Pick<UserRow, 'id' | 'username'>;
    return toPublicUser(row);
  } catch (err) {
    if (isUniqueViolation(err)) return null;
    throw err;
  }
}

export function findUserForLogin(db: Db, username: string): UserRow | undefined {
  return db
    .prepare('SELECT id, username, password_hash FROM users WHERE username = ?')
    .get(username) as UserRow | undefined;
}

// 쿠키에는 무작위 토큰 원문을, DB에는 그 해시만 둔다.
// DB가 유출돼도 해시로는 남의 세션 쿠키를 만들 수 없다.
export function createSession(db: Db, userId: string, now: number): string {
  const token = randomBytes(32).toString('base64url');
  db.prepare('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)').run(
    hashToken(token),
    userId,
    now + SESSION_TTL_MS,
  );
  return token;
}

export function findSessionUser(db: Db, token: string, now: number): PublicUser | null {
  const row = db
    .prepare(
      `SELECT users.id, users.username
         FROM sessions JOIN users ON users.id = sessions.user_id
        WHERE sessions.token_hash = ? AND sessions.expires_at > ?`,
    )
    .get(hashToken(token), now) as Pick<UserRow, 'id' | 'username'> | undefined;
  return row ? toPublicUser(row) : null;
}

export function deleteSession(db: Db, token: string) {
  db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(hashToken(token));
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function isUniqueViolation(err: unknown): boolean {
  return err instanceof Error && 'errcode' in err && err.errcode === 2067; // SQLITE_CONSTRAINT_UNIQUE
}
