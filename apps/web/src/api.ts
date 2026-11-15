import type { Credentials, PublicUser } from '@brainreader/shared';

// 서버 응답을 문자열 키로 꺼내 쓰지 않도록 응답 모양을 여기서 한 번 정한다.
export type AuthResult = { ok: true; user: PublicUser } | { ok: false; error: string };

// 서버가 꺼져 있거나 프록시가 502를 주면 응답 본문이 JSON이 아니다.
// 그때도 예외를 던지지 않고 실패 결과로 돌려줘야 화면이 "처리 중"에 멈추지 않는다.
async function postCredentials(path: string, body: Credentials): Promise<AuthResult> {
  let res: Response;
  try {
    res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    return { ok: false, error: 'network' };
  }
  const data = await res.json().catch(() => null);
  if (res.ok && data?.user) return { ok: true, user: data.user };
  return { ok: false, error: data?.error ?? 'serverError' };
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
