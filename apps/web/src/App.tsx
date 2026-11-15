import { useCallback, useEffect, useState } from 'react';
import type { PublicUser } from '@brainreader/shared';
import { fetchMe, logout } from './api.ts';
import { AuthForm } from './AuthForm.tsx';
import { Home } from './Home.tsx';

export function App() {
  // undefined: 아직 확인 중, null: 로그인 안 됨
  const [user, setUser] = useState<PublicUser | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    fetchMe().then((me) => {
      if (!cancelled) setUser(me);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogout = useCallback(async () => {
    await logout();
    setUser(null);
  }, []);
  const handleSessionExpired = useCallback(() => setUser(null), []);

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: 24 }}>
      <h1>BrainReader</h1>
      {user === undefined && <p>확인 중</p>}
      {user === null && <AuthForm onLogin={setUser} />}
      {user && <Home user={user} onLogout={handleLogout} onSessionExpired={handleSessionExpired} />}
    </main>
  );
}
