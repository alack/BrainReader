import type { ChatMessage, RoomView } from '@brainreader/shared';
import { Chat } from './Chat.tsx';

export function RoomScreen({
  room,
  messages,
  onLeave,
  onSendChat,
}: {
  room: RoomView;
  messages: ChatMessage[];
  onLeave: () => void;
  onSendChat: (text: string) => Promise<string | null>;
}) {
  const { players } = room.game;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16 }}>
      <aside>
        <h2 data-testid="room-name">
          {room.name} {room.locked && '🔒'}
        </h2>
        <p>
          {room.rounds}라운드 · {room.roundTimeSec}초 · 최대 {room.maxPlayers}명
        </p>
        <h3>참가자 {players.length}명</h3>
        <ul data-testid="player-list">
          {players.map((p) => (
            <li key={p.id}>{p.name}</li>
          ))}
        </ul>
        <button onClick={onLeave}>나가기</button>
      </aside>
      <section>
        <p>그림판과 게임 진행은 v0.06에서 붙는다.</p>
        <Chat messages={messages} onSend={onSendChat} placeholder="채팅 또는 정답 입력" />
      </section>
    </div>
  );
}
