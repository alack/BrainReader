import { useEffect, useState } from 'react';
import type { PublicUser } from '@brainreader/shared';
import { socket } from './socket.ts';

type Status = 'connecting' | 'connected' | 'disconnected' | 'replaced';

const STATUS_TEXT: Record<Status, string> = {
  connecting: '연결 중',
  connected: '서버 연결됨',
  disconnected: '연결 끊김',
  replaced: '다른 곳에서 같은 계정으로 접속해 연결을 끊었습니다.',
};

export function Home({
  user,
  onLogout,
  onSessionExpired,
}: {
  user: PublicUser;
  onLogout: () => void;
  onSessionExpired: () => void;
}) {
  const [status, setStatus] = useState<Status>('connecting');
  const [latencyMs, setLatencyMs] = useState<number | null>(null);

  useEffect(() => {
    const onConnect = () => setStatus('connected');
    const onDisconnect = () => setStatus((s) => (s === 'replaced' ? s : 'disconnected'));
    const onReplaced = () => setStatus('replaced');
    // 서버의 io.use()가 세션을 거절하면 여기로 온다.
    const onConnectError = (err: Error) => {
      if (err.message === 'unauthorized') onSessionExpired();
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('session:replaced', onReplaced);
    socket.on('connect_error', onConnectError);
    socket.connect();

    // 등록한 리스너는 같은 effect의 정리 함수에서 반드시 해제한다.
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('session:replaced', onReplaced);
      socket.off('connect_error', onConnectError);
      socket.disconnect();
    };
  }, [onSessionExpired]);

  const ping = () => {
    const sentAt = Date.now();
    socket.emit('ping', () => setLatencyMs(Date.now() - sentAt));
  };

  return (
    <section>
      <p>
        <strong data-testid="username">{user.username}</strong>님{' '}
        <button onClick={onLogout}>로그아웃</button>
      </p>
      <p data-testid="status">{STATUS_TEXT[status]}</p>
      <button onClick={ping} disabled={status !== 'connected'}>
        ping
      </button>
      {latencyMs !== null && <p data-testid="latency">응답 {latencyMs}ms</p>}
    </section>
  );
}
