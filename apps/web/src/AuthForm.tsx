import { useState, type FormEvent } from 'react';
import { credentialsSchema, type PublicUser } from '@brainreader/shared';
import { login, register } from './api.ts';

const ERROR_TEXT: Record<string, string> = {
  invalidCredentials: '아이디 또는 비밀번호가 맞지 않습니다.',
  usernameTaken: '이미 쓰는 아이디입니다.',
  invalidInput: '입력 형식이 맞지 않습니다.',
  network: '서버에 연결할 수 없습니다.',
  serverError: '서버에서 오류가 났습니다. 잠시 뒤 다시 시도하세요.',
};

export function AuthForm({ onLogin }: { onLogin: (user: PublicUser) => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    // 서버와 같은 스키마로 먼저 검사해서 바로 알려 준다. 최종 판단은 서버가 한다.
    const parsed = credentialsSchema.safeParse({ username, password });
    if (mode === 'register' && !parsed.success) {
      setError(parsed.error.issues[0]?.message ?? ERROR_TEXT.invalidInput!);
      return;
    }

    setPending(true);
    setError(null);
    const result = await (mode === 'login' ? login : register)({ username, password });
    setPending(false);

    if (result.ok) onLogin(result.user);
    else setError(ERROR_TEXT[result.error] ?? '알 수 없는 오류가 났습니다.');
  };

  return (
    <form onSubmit={submit} style={{ display: 'grid', gap: 8, maxWidth: 280 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" onClick={() => setMode('login')} disabled={mode === 'login'}>
          로그인
        </button>
        <button type="button" onClick={() => setMode('register')} disabled={mode === 'register'}>
          회원가입
        </button>
      </div>
      <input
        aria-label="아이디"
        placeholder="아이디"
        autoComplete="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        aria-label="비밀번호"
        placeholder="비밀번호"
        type="password"
        autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit" disabled={pending || username === '' || password === ''}>
        {mode === 'login' ? '로그인' : '가입하고 시작'}
      </button>
      {error && <p role="alert">{error}</p>}
    </form>
  );
}
