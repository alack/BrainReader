import { useEffect, useState } from 'react';
import type { ChatMessage, Player, PublicUser, RoomView, Stroke } from '@brainreader/shared';
import { Canvas } from './Canvas.tsx';
import { Chat } from './Chat.tsx';
import { clock } from './socket.ts';

// 서버가 정한 마감 시각까지 남은 초. 매초 서버가 알려 주지 않고 브라우저가 계산한다 (REVIEW 2-4).
function useSecondsLeft(endsAt: number | null) {
  const [now, setNow] = useState(clock.serverNow());
  useEffect(() => {
    if (endsAt === null) return;
    const id = window.setInterval(() => setNow(clock.serverNow()), 250);
    return () => window.clearInterval(id);
  }, [endsAt]);
  return endsAt === null ? null : Math.max(0, Math.ceil((endsAt - now) / 1000));
}

export function RoomScreen({
  me,
  room,
  word,
  strokes,
  ranking,
  messages,
  onLeave,
  onReady,
  onSendChat,
  onStroke,
  onClear,
}: {
  me: PublicUser;
  room: RoomView;
  word: string | null;
  strokes: Stroke[];
  ranking: Player[] | null;
  messages: ChatMessage[];
  onLeave: () => void;
  onReady: (ready: boolean) => void;
  onSendChat: (text: string) => Promise<string | null>;
  onStroke: (stroke: Stroke) => void;
  onClear: () => void;
}) {
  const { players, phase } = room.game;
  const myself = players.find((p) => p.id === me.id);
  const drawing = phase.kind === 'drawing' ? phase : null;
  const isDrawer = drawing?.drawerId === me.id;
  const correctIds = phase.kind === 'lobby' ? [] : phase.correctIds;
  const secondsLeft = useSecondsLeft(drawing ? drawing.endsAt : null);
  const drawerName = drawing ? players.find((p) => p.id === drawing.drawerId)?.name : null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr 300px', gap: 16, alignItems: 'start' }}>
      <aside>
        <h2 data-testid="room-name">
          {room.name} {room.locked && '🔒'}
        </h2>
        <p>
          {room.rounds}라운드 · {room.roundTimeSec}초 · 최대 {room.maxPlayers}명
        </p>
        <ul data-testid="player-list" style={{ listStyle: 'none', padding: 0 }}>
          {players.map((p) => (
            <li key={p.id} style={{ padding: '4px 0' }}>
              {drawing?.drawerId === p.id && '✏️ '}
              {correctIds.includes(p.id) && '✅ '}
              <b>{p.name}</b> {p.score}점
              {phase.kind === 'lobby' && (p.ready ? ' · 준비' : ' · 대기')}
            </li>
          ))}
        </ul>
        {phase.kind === 'lobby' && myself && (
          <button onClick={() => onReady(!myself.ready)}>{myself.ready ? '준비 취소' : '준비'}</button>
        )}{' '}
        <button onClick={onLeave}>나가기</button>
      </aside>

      <section style={{ display: 'grid', gap: 8 }}>
        <div data-testid="game-status" style={{ minHeight: 28 }}>
          {phase.kind === 'lobby' && (players.length < 2 ? '2명 이상 모이면 시작할 수 있습니다.' : '모두 준비하면 시작합니다.')}
          {drawing && (
            <>
              {drawing.round}/{room.rounds}라운드 · 남은 시간 <b data-testid="seconds-left">{secondsLeft}</b>초 ·{' '}
              {isDrawer ? (
                <>
                  제시어 <b data-testid="word">{word ?? '…'}</b>
                </>
              ) : (
                <>{drawerName}님이 그리는 중</>
              )}
            </>
          )}
          {phase.kind === 'roundEnd' && (
            <>
              정답은 <b data-testid="answer">{phase.word}</b>
            </>
          )}
        </div>
        <Canvas strokes={strokes} canDraw={isDrawer} onStroke={onStroke} onClear={onClear} />
        {phase.kind === 'lobby' && ranking && (
          <div data-testid="ranking">
            <h3>지난 게임 결과</h3>
            <ol>
              {ranking.map((p) => (
                <li key={p.id}>
                  {p.name} {p.score}점
                </li>
              ))}
            </ol>
          </div>
        )}
      </section>

      <section>
        <Chat messages={messages} onSend={onSendChat} placeholder={isDrawer ? '출제자는 채팅할 수 없습니다' : '채팅 또는 정답 입력'} />
      </section>
    </div>
  );
}
