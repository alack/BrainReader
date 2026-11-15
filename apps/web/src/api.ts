import type { Credentials, PublicUser } from '@brainreader/shared';

// 서버 응답을 문자열 키로 꺼내 쓰지 않도록 응답 모양을 여기서 한 번 정한다.
export type AuthResult = { ok: true; user: PublicUser } | { ok: false; error: string };

async function postCredentials(path: string, body: Credentials): Promise<AuthResult> {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return res.ok ? { ok: true, user: data.user } : { ok: false, error: data.error };
}

export const register = (body: Credentials) => postCredentials('/api/auth/register', body);
export const login = (body: Credentials) => postCredentials('/api/auth/login', body);

export async function fetchMe(): Promise<PublicUser | null> {
  const res = await fetch('/api/auth/me');
  if (!res.ok) return null;
  return (await res.json()).user;
}

export async function logout() {
  await fetch('/api/auth/logout', { method: 'POST' });
}
