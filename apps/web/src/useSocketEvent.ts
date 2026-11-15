import { useEffect, useRef } from 'react';
import type { ServerToClientEvents } from '@brainreader/shared';
import { socket } from './socket.ts';

// 소켓 리스너를 컴포넌트 수명에 묶는다. 마운트할 때 등록하고 언마운트할 때 반드시 해제한다.
// 2017년에는 이 해제가 없어서 화면을 드나들 때마다 리스너가 쌓였다 (REVIEW C1~C3).
export function useSocketEvent<E extends keyof ServerToClientEvents>(event: E, handler: ServerToClientEvents[E]) {
  // 매 렌더마다 새로 만들어지는 handler를 다시 등록하지 않도록 최신 handler는 ref에 둔다.
  const latest = useRef(handler);
  useEffect(() => {
    latest.current = handler;
  });

  useEffect(() => {
    const listener = ((...args: unknown[]) =>
      (latest.current as (...a: unknown[]) => void)(...args)) as ServerToClientEvents[E];
    socket.on(event, listener as never);
    return () => {
      socket.off(event, listener as never);
    };
  }, [event]);
}
