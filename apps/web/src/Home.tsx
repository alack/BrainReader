import { useEffect, useState } from 'react';
import type { Ack, ChatMessage, CreateRoomInput, LobbyState, PublicUser, RoomView } from '@brainreader/shared';
import { socket } from './socket.ts';
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

  // 서버가 접속 직후 바로 보내는 이벤트가 있으므로 리스너는 연결보다 먼저 등록한다.
  // (자식 컴포넌트에서 등록하면 화면이 그려지기 전에 온 이벤트를 놓친다.)
  useSocketEvent('lobby:state', setLobby);
  useSocketEvent('lobby:chat', (m) => setLobbyMessages((list) => append(list, m)));
  useSocketEvent('room:state', setRoom);
  useSocketEvent('room:chat', (m) => setRoomMessages((list) => append(list, m)));
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

  const enterRoom = (res: Ack<RoomView>) => {
    if (res.ok) {
      setRoom(res.data);
      setRoomMessages([]);
    }
    return failure(res);
  };

  const api = {
    createRoom: async (input: CreateRoomInput) =>
      enterRoom(await request(socket.timeout(5000).emitWithAck('room:create', input))),
    joinRoom: async (roomId: string, password?: string) =>
      enterRoom(await request(socket.timeout(5000).emitWithAck('room:join', { roomId, password }))),
    leaveRoom: async () => {
      await request(socket.timeout(5000).emitWithAck('room:leave'));
      setRoom(null);
    },
    sendLobbyChat: async (text: string) => {
      socket.emit('lobby:chat', text);
      return null;
    },
    sendRoomChat: async (text: string) => failure(await request(socket.timeout(5000).emitWithAck('room:chat', text))),
  };

  return (
    <section>
      <p>
        <strong data-testid="username">{user.username}</strong>님{' '}
        <button onClick={onLogout}>로그아웃</button> <span data-testid="status">{STATUS_TEXT[status]}</span>
      </p>
      {status === 'connected' && room && (
        <RoomScreen room={room} messages={roomMessages} onLeave={api.leaveRoom} onSendChat={api.sendRoomChat} />
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
