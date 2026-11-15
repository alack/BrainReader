import { useEffect, useState } from 'react';
import { socket } from './socket.ts';

export function App() {
  const [connected, setConnected] = useState(socket.connected);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);

  useEffect(() => {
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.connect();

    // 등록한 리스너는 같은 effect의 정리 함수에서 반드시 해제한다.
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.disconnect();
    };
  }, []);

  const ping = () => {
    const sentAt = Date.now();
    socket.emit('ping', () => setLatencyMs(Date.now() - sentAt));
  };

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: 24 }}>
      <h1>BrainReader</h1>
      <p data-testid="status">{connected ? '서버 연결됨' : '연결 안 됨'}</p>
      <button onClick={ping} disabled={!connected}>
        ping
      </button>
      {latencyMs !== null && <p data-testid="latency">응답 {latencyMs}ms</p>}
    </main>
  );
}
