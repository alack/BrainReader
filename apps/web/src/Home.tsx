import { useEffect, useRef, useState } from 'react';
import type {
  Ack,
  ChatMessage,
  CreateRoomInput,
  LobbyState,
  Player,
  PublicGameEvent,
  PublicUser,
  RoomView,
  Stroke,
} from '@brainreader/shared';
import { clock, socket } from './socket.ts';
import { useSocketEvent } from './useSocketEvent.ts';
import { errorText } from './errors.ts';
import { Lobby } from './Lobby.tsx';
import { RoomScreen } from './RoomScreen.tsx';

type Status = 'connecting' | 'connected' | 'disconnected' | 'replaced';

const STATUS_TEXT: Record<Status, string> = {
  connecting: '연결 중',
  connected: '서버 연결됨',
  disconnected: '연결 끊김',
  replaced: '다른 곳에서 같은 계정으로 접속해 연결을 끊었습니다.',
};

const MAX_MESSAGES = 100;
const append = (list: ChatMessage[], m: ChatMessage) => [...list, m].slice(-MAX_MESSAGES);
const notice = (text: string): ChatMessage => ({ userId: 'system', username: '📢', text, sentAt: Date.now() });

// 게임 이벤트를 채팅창에 보여 줄 안내 문구로 바꾼다.
function describe(event: PublicGameEvent, nameOf: (id: string) => string): string {
  switch (event.type) {
    case 'gameStarted':
      return '게임을 시작합니다.';
    case 'roundStarted':
      return `${event.round}라운드: ${nameOf(event.drawerId)}님이 그립니다.`;
    case 'correctGuess':
      return `${nameOf(event.playerId)}님이 ${event.order}번째로 맞혔습니다! (+${event.points}점, 출제자 +${event.drawerPoints}점)`;
    case 'roundEnded': {
      const why = { allGuessed: '모두 맞혔습니다', timeout: '시간 초과', drawerLeft: '출제자가 나갔습니다' }[event.reason];
      return `${why}. 정답은 "${event.word}"`;
    }
    case 'gameEnded':
      return event.reason === 'notEnoughPlayers'
        ? '인원이 부족해 게임을 마칩니다.'
        : `게임 끝! 1위 ${event.ranking[0]?.name ?? ''} (${event.ranking[0]?.score ?? 0}점)`;
  }
}

// ack를 기다리다 5초가 지나면 실패로 본다.
async function request<T>(send: Promise<Ack<T>>): Promise<Ack<T>> {
  try {
    return await send;
  } catch {
    return { ok: false, error: 'timeout' };
  }
}
const failure = <T,>(res: Ack<T>) => (res.ok ? null : errorText(res.error));

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
  const [lobby, setLobby] = useState<LobbyState | null>(null);
  const [lobbyMessages, setLobbyMessages] = useState<ChatMessage[]>([]);
  const [room, setRoom] = useState<RoomView | null>(null);
  const [roomMessages, setRoomMessages] = useState<ChatMessage[]>([]);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [word, setWord] = useState<{ round: number; word: string } | null>(null);
  const [ranking, setRanking] = useState<Player[] | null>(null);
  const roomRef = useRef(room);
  roomRef.current = room;

  // 서버가 접속 직후나 입장 직후 바로 보내는 이벤트가 있으므로 리스너는 연결보다 먼저,
  // 항상 화면에 있는 이 컴포넌트에서 등록한다. 방 화면에서 등록하면 그려지기 전에 온 이벤트를 놓친다.
  useSocketEvent('hello', ({ serverTime }) => {
    clock.offsetMs = serverTime - Date.now();
  });
  useSocketEvent('lobby:state', setLobby);
  useSocketEvent('lobby:chat', (m) => setLobbyMessages((list) => append(list, m)));
  useSocketEvent('room:state', setRoom);
  useSocketEvent('room:chat', (m) => setRoomMessages((list) => append(list, m)));
  useSocketEvent('game:event', (event) => {
    const nameOf = (id: string) => roomRef.current?.game.players.find((p) => p.id === id)?.name ?? '?';
    setRoomMessages((list) => append(list, notice(describe(event, nameOf))));
    if (event.type === 'gameStarted') setRanking(null);
    if (event.type === 'gameEnded') setRanking(event.ranking);
  });
  useSocketEvent('round:word', setWord);
  useSocketEvent('draw:stroke', (s) => setStrokes((list) => [...list, s]));
  useSocketEvent('draw:clear', () => setStrokes([]));
  useSocketEvent('draw:sync', setStrokes);
  useSocketEvent('session:replaced', () => setStatus('replaced'));

  useEffect(() => {
    const onConnect = () => setStatus('connected');
    const onDisconnect = () => {
      setStatus((s) => (s === 'replaced' ? s : 'disconnected'));
      setRoom(null); // 연결이 끊기면 서버가 방에서 내보낸다.
    };
    // 서버의 io.use()가 세션을 거절하면 여기로 온다.
    const onConnectError = (err: Error) => {
      if (err.message === 'unauthorized') onSessionExpired();
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    socket.connect();
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.disconnect();
    };
  }, [onSessionExpired]);

  // 방에 들어가기 직전에 이전 방의 흔적을 지운다. 입장 직후 서버가 보내는 draw:sync가 그 위에 채워진다.
  const resetRoom = () => {
    setRoomMessages([]);
    setStrokes([]);
    setWord(null);
    setRanking(null);
  };
  const enterRoom = (res: Ack<RoomView>) => {
    if (res.ok) setRoom(res.data);
    return failure(res);
  };

  const api = {
    createRoom: async (input: CreateRoomInput) => {
      resetRoom();
      return enterRoom(await request(socket.timeout(5000).emitWithAck('room:create', input)));
    },
    joinRoom: async (roomId: string, password?: string) => {
      resetRoom();
      return enterRoom(await request(socket.timeout(5000).emitWithAck('room:join', { roomId, password })));
    },
    leaveRoom: async () => {
      await request(socket.timeout(5000).emitWithAck('room:leave'));
      setRoom(null);
    },
    ready: async (ready: boolean) => {
      const err = failure(await request(socket.timeout(5000).emitWithAck('room:ready', ready)));
      if (err) setRoomMessages((list) => append(list, notice(err)));
    },
    sendLobbyChat: async (text: string) => {
      socket.emit('lobby:chat', text);
      return null;
    },
    sendRoomChat: async (text: string) => failure(await request(socket.timeout(5000).emitWithAck('room:chat', text))),
    stroke: (s: Stroke) => {
      setStrokes((list) => [...list, s]);
      socket.emit('draw:stroke', s);
    },
    clear: () => {
      setStrokes([]);
      socket.emit('draw:clear');
    },
  };

  const phase = room?.game.phase;
  const currentWord = phase?.kind === 'drawing' && word?.round === phase.round ? word.word : null;

  return (
    <section>
      <p>
        <strong data-testid="username">{user.username}</strong>님{' '}
        <button onClick={onLogout}>로그아웃</button> <span data-testid="status">{STATUS_TEXT[status]}</span>
      </p>
      {status === 'connected' && room && (
        <RoomScreen
          me={user}
          room={room}
          word={currentWord}
          strokes={strokes}
          ranking={ranking}
          messages={roomMessages}
          onLeave={api.leaveRoom}
          onReady={api.ready}
          onSendChat={api.sendRoomChat}
          onStroke={api.stroke}
          onClear={api.clear}
        />
      )}
      {status === 'connected' && !room && lobby && (
        <Lobby
          lobby={lobby}
          messages={lobbyMessages}
          onCreate={api.createRoom}
          onJoin={api.joinRoom}
          onSendChat={api.sendLobbyChat}
        />
      )}
    </section>
  );
}
