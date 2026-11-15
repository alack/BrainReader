import { describe, expect, it } from 'vitest';
import type { CreateRoomInput, Stroke } from '@brainreader/shared';
import { collect, next, nextWhere, startServer, type Client } from '../testing.ts';

// 테스트에서는 "1초"를 10ms로 줄인다. 30초 라운드 = 300ms, 라운드 사이 쉬는 시간 = 50ms.
const FAST = { timing: { msPerSecond: 10, roundEndPauseMs: 50 } };
const ROOM: CreateRoomInput = { name: '한판', maxPlayers: 4, rounds: 1, roundTimeSec: 30 };

// 첫 사람이 방을 만들고(첫 출제자), 나머지가 들어온다.
async function setup(names: string[], room: Partial<CreateRoomInput> = {}) {
  const { login } = await startServer(FAST);
  const clients: Client[] = [];
  for (const name of names) clients.push(await login(name));
  const [host, ...guests] = clients;
  const created = await host!.emitWithAck('room:create', { ...ROOM, ...room });
  if (!created.ok) throw new Error(created.error);
  for (const guest of guests) await guest.emitWithAck('room:join', { roomId: created.data.id });
  return { clients, roomId: created.data.id, login };
}

const roomOf = async (names: string[], room: Partial<CreateRoomInput> = {}) => (await setup(names, room)).clients;

async function readyAll(clients: Client[]) {
  for (const c of clients) expect(await c.emitWithAck('room:ready', true)).toEqual({ ok: true });
}

const STROKE: Stroke = { strokeId: 's1', color: '#111111', width: 0.01, points: [[0.1, 0.1], [0.5, 0.5]] };

describe('게임 진행', () => {
  it('모두 준비하면 시작하고, 정답 단어는 출제자에게만 간다 (REVIEW 2-3)', async () => {
    const [alice, bob] = await roomOf(['alice', 'bob']);
    const aliceWord = next(alice!, 'round:word');
    const bobWords = collect(bob!, 'round:word', 200);
    const started = nextWhere(bob!, 'game:event', (e) => e.type === 'roundStarted');

    await readyAll([alice!, bob!]);

    expect(await aliceWord).toEqual({ round: 1, word: '사과' });
    expect(await started).toMatchObject({ type: 'roundStarted', round: 1 });
    expect(await bobWords).toEqual([]);
  });

  it('정답을 맞히면 점수가 반영되고, 마지막 라운드 뒤 게임이 끝난다', async () => {
    const [alice, bob] = await roomOf(['alice', 'bob']);
    const ended = nextWhere(alice!, 'game:event', (e) => e.type === 'gameEnded');
    await readyAll([alice!, bob!]);

    expect(await bob!.emitWithAck('room:chat', '사과')).toEqual({ ok: true });
    const result = await ended;
    if (result.type !== 'gameEnded') throw new Error(result.type);
    expect(result.ranking.map((p) => [p.name, p.score])).toEqual([
      ['bob', 10],
      ['alice', 2],
    ]);
  });

  it('아무도 못 맞히면 서버 타이머가 라운드를 끝낸다 (REVIEW 2-4)', async () => {
    const [alice, bob] = await roomOf(['alice', 'bob']);
    const roundEnded = nextWhere(bob!, 'game:event', (e) => e.type === 'roundEnded');
    await readyAll([alice!, bob!]);
    expect(await roundEnded).toMatchObject({ reason: 'timeout', word: '사과', correctIds: [] });
  });

  it('출제자는 채팅할 수 없다는 이유를 돌려받는다', async () => {
    const [alice, bob] = await roomOf(['alice', 'bob'], { roundTimeSec: 180 });
    await readyAll([alice!, bob!]);
    expect(await alice!.emitWithAck('room:chat', '힌트')).toEqual({ ok: false, error: 'drawerCannotChat' });
  });
});

describe('그리기', () => {
  it('출제자의 획은 다른 사람에게 가고, 출제자가 아닌 사람의 획은 버려진다 (REVIEW S2)', async () => {
    const [alice, bob] = await roomOf(['alice', 'bob'], { roundTimeSec: 180 });
    await readyAll([alice!, bob!]);

    const bobGot = next(bob!, 'draw:stroke');
    alice!.emit('draw:stroke', STROKE);
    expect(await bobGot).toEqual(STROKE);

    const aliceGot = collect(alice!, 'draw:stroke', 200);
    bob!.emit('draw:stroke', { ...STROKE, strokeId: 'cheat' });
    expect(await aliceGot).toEqual([]);
  });

  it('형식이 틀린 획(캔버스 밖 좌표, 팔레트에 없는 색)은 버려진다', async () => {
    const [alice, bob] = await roomOf(['alice', 'bob'], { roundTimeSec: 180 });
    await readyAll([alice!, bob!]);
    const bobGot = collect(bob!, 'draw:stroke', 200);
    alice!.emit('draw:stroke', { ...STROKE, points: [[2, 2]] });
    alice!.emit('draw:stroke', { ...STROKE, color: 'url(javascript:alert(1))' } as unknown as Stroke);
    expect(await bobGot).toEqual([]);
  });

  it('라운드 도중 들어온 사람은 지금까지 그린 그림을 받는다 (2017년에는 빈 캔버스였다, REVIEW C7)', async () => {
    const { clients, roomId, login } = await setup(['alice', 'bob'], { roundTimeSec: 180 });
    const [alice, bob] = clients;
    await readyAll([alice!, bob!]);
    const bobGot = next(bob!, 'draw:stroke');
    alice!.emit('draw:stroke', STROKE);
    await bobGot;

    const carol = await login('carol');
    const synced = next(carol, 'draw:sync');
    expect((await carol.emitWithAck('room:join', { roomId })).ok).toBe(true);
    expect(await synced).toEqual([STROKE]);
  });

  it('출제자가 전체 지우기를 하면 다른 사람 캔버스도 지워지고, 이후 입장자는 그림을 받지 않는다', async () => {
    const { clients, roomId, login } = await setup(['alice', 'bob'], { roundTimeSec: 180 });
    const [alice, bob] = clients;
    await readyAll([alice!, bob!]);
    const stroke = next(bob!, 'draw:stroke');
    alice!.emit('draw:stroke', STROKE);
    await stroke;

    const cleared = next(bob!, 'draw:clear');
    alice!.emit('draw:clear');
    await cleared;

    const carol = await login('carol');
    const synced = collect(carol, 'draw:sync', 200);
    await carol.emitWithAck('room:join', { roomId });
    expect(await synced).toEqual([]);
  });
});
