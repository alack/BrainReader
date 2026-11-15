import { describe, expect, it } from 'vitest';
import type { Socket } from 'socket.io-client';
import type { CreateRoomInput, RoomView } from '@brainreader/shared';
import { lobbyWhere, next, startServer, type Client } from '../testing.ts';

const ROOM: CreateRoomInput = { name: '그림방', maxPlayers: 4, rounds: 3, roundTimeSec: 60 };

async function create(client: Client, input: CreateRoomInput = ROOM): Promise<RoomView> {
  const res = await client.emitWithAck('room:create', input);
  if (!res.ok) throw new Error(res.error);
  return res.data;
}

describe('대기실', () => {
  it('접속하면 접속자 목록이 모두에게 갱신된다', async () => {
    const { login } = await startServer();
    const alice = await login('alice');
    const updated = lobbyWhere(alice, (s) => s.users.length === 2);
    await login('bob');
    expect((await updated).users.map((u) => u.username).sort()).toEqual(['alice', 'bob']);
  });

  it('방을 만들면 새로고침 없이 다른 사람의 방 목록에 나타나고, 비밀번호는 나가지 않는다 (REVIEW S11)', async () => {
    const { login } = await startServer();
    const alice = await login('alice');
    const bob = await login('bob');

    const seen = lobbyWhere(bob, (s) => s.rooms.length === 1);
    await create(alice, { ...ROOM, password: 'secret' });
    const state = await seen;

    expect(state.rooms[0]).toMatchObject({ name: '그림방', locked: true, playerCount: 1, maxPlayers: 4 });
    expect(JSON.stringify(state)).not.toContain('secret');
    expect(state.users.find((u) => u.username === 'alice')?.roomId).toBe(state.rooms[0]!.id);
  });

  it('잘못된 방 설정은 거절한다', async () => {
    const { login } = await startServer();
    const alice = await login('alice');
    const res = await alice.emitWithAck('room:create', { ...ROOM, maxPlayers: 99 });
    expect(res).toEqual({ ok: false, error: 'invalidInput' });
  });

  it('대기실 채팅은 대기실에만, 방 채팅은 그 방에만 간다', async () => {
    const { login } = await startServer();
    const alice = await login('alice');
    const bob = await login('bob');
    await create(alice);

    const lobbyMsg = next(bob, 'lobby:chat');
    let aliceGotLobby = false;
    alice.on('lobby:chat', () => (aliceGotLobby = true));
    bob.emit('lobby:chat', '안녕');
    expect(await lobbyMsg).toMatchObject({ username: 'bob', text: '안녕' });

    const roomMsg = next(alice, 'room:chat');
    expect(await alice.emitWithAck('room:chat', '방 안')).toEqual({ ok: true });
    expect(await roomMsg).toMatchObject({ username: 'alice', text: '방 안' });
    expect(aliceGotLobby).toBe(false);
  });
});

describe('방 입장과 퇴장', () => {
  it('비밀번호가 틀리면 들어갈 수 없고, 맞으면 들어가서 서로 보인다 (REVIEW S10)', async () => {
    const { login } = await startServer();
    const alice = await login('alice');
    const bob = await login('bob');
    const room = await create(alice, { ...ROOM, password: 'secret' });

    expect(await bob.emitWithAck('room:join', { roomId: room.id, password: 'nope' })).toEqual({
      ok: false,
      error: 'wrongPassword',
    });

    const aliceSees = next(alice, 'room:state');
    const res = await bob.emitWithAck('room:join', { roomId: room.id, password: 'secret' });
    expect(res.ok).toBe(true);
    expect((await aliceSees).game.players.map((p) => p.name)).toEqual(['alice', 'bob']);
  });

  it('정원이 차면 들어갈 수 없다', async () => {
    const { login } = await startServer();
    const alice = await login('alice');
    const bob = await login('bob');
    const carol = await login('carol');
    const room = await create(alice, { ...ROOM, maxPlayers: 2 });
    await bob.emitWithAck('room:join', { roomId: room.id });
    expect(await carol.emitWithAck('room:join', { roomId: room.id })).toEqual({ ok: false, error: 'roomFull' });
  });

  it('없는 방에는 들어갈 수 없다', async () => {
    const { login } = await startServer();
    const alice = await login('alice');
    expect(await alice.emitWithAck('room:join', { roomId: 'nope' })).toEqual({ ok: false, error: 'roomNotFound' });
  });

  it('마지막 사람이 나가면 방이 목록에서 사라진다', async () => {
    const { login } = await startServer();
    const alice = await login('alice');
    const bob = await login('bob');
    await create(alice);
    await lobbyWhere(bob, (s) => s.rooms.length === 1);

    const gone = lobbyWhere(bob, (s) => s.rooms.length === 0);
    expect(await alice.emitWithAck('room:leave')).toEqual({ ok: true });
    await gone;
  });

  it('방에 있던 사람의 연결이 끊기면 남은 사람에게 바로 반영된다', async () => {
    const { login } = await startServer();
    const alice = await login('alice');
    const bob = await login('bob');
    const room = await create(alice);
    await bob.emitWithAck('room:join', { roomId: room.id });

    const aliceSees = next(alice, 'room:state');
    bob.disconnect();
    expect((await aliceSees).game.players.map((p) => p.name)).toEqual(['alice']);
  });

  it('ack 함수 없이 보내도 서버가 죽지 않는다 (REVIEW S1)', async () => {
    const { login } = await startServer();
    const alice = await login('alice');
    (alice as unknown as Socket).emit('room:create', ROOM); // ack 없음
    (alice as unknown as Socket).emit('room:chat', 12345); // 방 밖, 잘못된 타입
    expect(await alice.emitWithAck('room:leave')).toEqual({ ok: true });
  });
});
