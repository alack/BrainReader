import { describe, expect, it } from 'vitest';
import { Game, GameError, guessPoints, type GameEvent, type GameSettings } from './game.ts';

const SETTINGS: GameSettings = {
  maxPlayers: 4,
  rounds: 3,
  roundTimeMs: 60_000,
  roundEndPauseMs: 3_000,
};

// 단어를 정해진 순서로 내준다.
function makeGame(settings: Partial<GameSettings> = {}, words = ['사과', '바나나', '체리', '포도']) {
  let i = 0;
  return new Game({ ...SETTINGS, ...settings }, () => words[i++ % words.length]!);
}

// A, B(, C...)를 넣고 모두 준비시켜 게임을 시작한다. 시작 시각은 0.
function startedGame(ids = ['A', 'B'], settings: Partial<GameSettings> = {}) {
  const game = makeGame(settings);
  for (const id of ids) game.addPlayer(id, id);
  let events: GameEvent[] = [];
  for (const id of ids) events = game.setReady(id, true, 0);
  return { game, events };
}

function types(events: GameEvent[]) {
  return events.map((e) => e.type);
}

function score(game: Game, id: string) {
  return game.snapshot().players.find((p) => p.id === id)?.score;
}

function drawing(game: Game) {
  const { phase } = game.snapshot();
  if (phase.kind !== 'drawing') throw new Error(`drawing이 아니라 ${phase.kind}`);
  return phase;
}

describe('입장과 시작', () => {
  it('혼자서는 준비해도 시작하지 않는다 (REVIEW S7)', () => {
    const game = makeGame();
    game.addPlayer('A', 'A');
    expect(game.setReady('A', true, 0)).toEqual([]);
    expect(game.snapshot().phase.kind).toBe('lobby');
  });

  it('두 명 이상이 모두 준비하면 시작하고, 첫 출제자는 먼저 들어온 사람이다', () => {
    const { game, events } = startedGame(['A', 'B']);
    expect(types(events)).toEqual(['gameStarted', 'roundStarted', 'wordAssigned']);
    expect(drawing(game)).toMatchObject({ round: 1, drawerId: 'A', endsAt: 60_000 });
  });

  it('준비하지 않은 사람이 나가서 남은 사람이 모두 준비 상태가 되면 시작한다', () => {
    const game = makeGame();
    for (const id of ['A', 'B', 'C']) game.addPlayer(id, id);
    game.setReady('A', true, 0);
    game.setReady('B', true, 0);
    expect(types(game.removePlayer('C', 0))).toContain('gameStarted');
  });

  it('정원이 차면 입장을 거절하고, 같은 사람이 두 번 들어올 수 없다', () => {
    const game = makeGame({ maxPlayers: 2 });
    game.addPlayer('A', 'A');
    expect(() => game.addPlayer('A', 'A')).toThrowError(new GameError('alreadyJoined'));
    game.addPlayer('B', 'B');
    expect(() => game.addPlayer('C', 'C')).toThrowError(new GameError('roomFull'));
  });

  it('게임 중에는 준비 상태를 바꿀 수 없다', () => {
    const { game } = startedGame();
    expect(() => game.setReady('B', false, 10)).toThrowError(new GameError('notInLobby'));
  });
});

describe('채팅과 정답', () => {
  it('게임 시작 전 채팅은 그냥 채팅이다 (REVIEW S1: 2017년에는 여기서 서버가 죽었다)', () => {
    const game = makeGame();
    game.addPlayer('A', 'A');
    expect(game.chat('A', ' 안녕 ', 0)).toEqual([{ type: 'chat', playerId: 'A', text: '안녕' }]);
  });

  it('빈 채팅은 무시한다', () => {
    const { game } = startedGame();
    expect(game.chat('B', '   ', 10)).toEqual([]);
  });

  it('정답 문장은 채팅으로 퍼지지 않고, 띄어쓰기는 무시한다', () => {
    const { game } = startedGame();
    const events = game.chat('B', '사 과', 10_000);
    expect(types(events)).toEqual(['correctGuess', 'roundEnded']);
    expect(JSON.stringify(events[0])).not.toContain('사과');
  });

  it('출제자는 채팅할 수 없다', () => {
    const { game } = startedGame();
    expect(() => game.chat('A', '힌트', 10)).toThrowError(new GameError('drawerCannotChat'));
  });

  it('라운드가 끝난 뒤의 정답은 점수가 되지 않는다', () => {
    const { game } = startedGame();
    game.chat('B', '사과', 10);
    expect(game.chat('B', '사과', 20)).toEqual([{ type: 'chat', playerId: 'B', text: '사과' }]);
    expect(score(game, 'B')).toBe(10);
  });

  it('이미 맞힌 사람은 라운드가 끝날 때까지 채팅할 수 없다', () => {
    const { game } = startedGame(['A', 'B', 'C']);
    game.chat('B', '사과', 10);
    expect(() => game.chat('B', 'ㅋㅋ', 20)).toThrowError(new GameError('alreadyGuessed'));
  });

  it('모두에게 보내는 스냅숏에는 정답 단어가 없다 (REVIEW 2-3)', () => {
    const { game } = startedGame();
    expect(JSON.stringify(game.snapshot())).not.toContain('사과');
  });
});

describe('점수', () => {
  it('맞힌 순서대로 10, 8, 6, 4, 2점이고 다섯 번째부터는 2점이다', () => {
    expect([1, 2, 3, 4, 5, 6].map(guessPoints)).toEqual([10, 8, 6, 4, 2, 2]);
  });

  it('한 명이 맞혀도 라운드는 계속되고, 모두 맞히면 끝난다. 출제자는 정답자마다 2점', () => {
    const { game } = startedGame(['A', 'B', 'C']);

    expect(game.chat('B', '사과', 10_000)).toEqual([
      { type: 'correctGuess', playerId: 'B', order: 1, points: 10, drawerId: 'A', drawerPoints: 2 },
    ]);
    expect(drawing(game).correctIds).toEqual(['B']);

    expect(game.chat('C', '사과', 20_000)).toEqual([
      { type: 'correctGuess', playerId: 'C', order: 2, points: 8, drawerId: 'A', drawerPoints: 2 },
      { type: 'roundEnded', round: 1, word: '사과', reason: 'allGuessed', correctIds: ['B', 'C'] },
    ]);
    expect([score(game, 'A'), score(game, 'B'), score(game, 'C')]).toEqual([4, 10, 8]);
  });

  it('일부만 맞히고 시간이 끝나면 맞힌 사람 점수만 남는다', () => {
    const { game } = startedGame(['A', 'B', 'C']);
    game.chat('C', '사과', 10_000);
    expect(game.tick(60_000)).toEqual([
      { type: 'roundEnded', round: 1, word: '사과', reason: 'timeout', correctIds: ['C'] },
    ]);
    expect([score(game, 'A'), score(game, 'B'), score(game, 'C')]).toEqual([2, 0, 10]);
  });

  it('아무도 못 맞히면 출제자도 0점이다', () => {
    const { game } = startedGame(['A', 'B', 'C']);
    game.tick(60_000);
    expect(score(game, 'A')).toBe(0);
  });

  it('못 맞힌 사람이 나가서 남은 사람이 모두 맞힌 상태가 되면 라운드가 끝난다', () => {
    const { game } = startedGame(['A', 'B', 'C']);
    game.chat('B', '사과', 10_000);
    expect(game.removePlayer('C', 20_000)).toEqual([
      { type: 'roundEnded', round: 1, word: '사과', reason: 'allGuessed', correctIds: ['B'] },
    ]);
  });
});

describe('시간', () => {
  it('제한 시간 전에는 아무 일도 없고, 제한 시간이 되면 시간 초과로 끝난다', () => {
    const { game } = startedGame();
    expect(game.tick(59_999)).toEqual([]);
    expect(game.tick(60_000)).toEqual([
      { type: 'roundEnded', round: 1, word: '사과', reason: 'timeout', correctIds: [] },
    ]);
  });

  it('라운드 사이 쉬는 시간이 지나면 다음 출제자 차례가 된다', () => {
    const { game } = startedGame();
    game.tick(60_000);
    expect(game.nextDeadline()).toBe(63_000);
    const events = game.tick(63_000);
    expect(types(events)).toEqual(['roundStarted', 'wordAssigned']);
    expect(drawing(game)).toMatchObject({ round: 2, drawerId: 'B' });
  });

  it('정답으로 끝난 다음 라운드도 제한 시간을 처음부터 받는다 (REVIEW S8)', () => {
    const { game } = startedGame();
    game.chat('B', '사과', 50_000); // 10초 남기고 정답
    game.tick(53_000);
    expect(drawing(game).endsAt).toBe(53_000 + 60_000);
  });

  it('출제 순서는 입장 순서대로 돌고, 같은 사람이 연달아 걸리지 않는다', () => {
    const { game } = startedGame(['A', 'B', 'C'], { rounds: 6 });
    const drawers: string[] = [];
    let now = 0;
    for (let r = 0; r < 6; r++) {
      drawers.push(drawing(game).drawerId);
      now += 60_000;
      game.tick(now);
      now += 3_000;
      game.tick(now);
    }
    expect(drawers).toEqual(['A', 'B', 'C', 'A', 'B', 'C']);
  });
});

describe('게임 종료', () => {
  it('마지막 라운드가 끝나면 순위를 내고 대기 상태로 돌아가며 준비가 풀린다', () => {
    const { game } = startedGame(['A', 'B'], { rounds: 2 });
    game.chat('B', '사과', 1_000); // 1라운드: A 출제, B 정답
    game.tick(4_000); // 2라운드: B 출제
    game.chat('A', '바나나', 5_000);
    const events = game.tick(8_000);

    expect(events).toHaveLength(1);
    const ended = events[0]!;
    if (ended.type !== 'gameEnded') throw new Error(ended.type);
    expect(ended.reason).toBe('finished');
    // 각자 한 번씩 출제(2점)하고 한 번씩 1등으로 맞혔다(10점).
    expect(ended.ranking.map((p) => [p.id, p.score])).toEqual([
      ['A', 12],
      ['B', 12],
    ]);
    expect(game.snapshot().phase.kind).toBe('lobby');
    expect(game.snapshot().players.every((p) => !p.ready)).toBe(true);
  });

  it('다시 모두 준비하면 점수를 0으로 되돌리고 새 게임을 시작한다', () => {
    const { game } = startedGame(['A', 'B'], { rounds: 1 });
    game.chat('B', '사과', 1_000);
    game.tick(4_000);
    game.setReady('A', true, 5_000);
    game.setReady('B', true, 5_000);
    expect(game.snapshot().players.map((p) => p.score)).toEqual([0, 0]);
    expect(drawing(game).round).toBe(1);
  });
});

describe('나가기', () => {
  it('출제자가 나가면 라운드가 끝나고, 다음 출제자는 건너뛰지 않는다', () => {
    const { game } = startedGame(['A', 'B', 'C']);
    expect(game.removePlayer('A', 10_000)).toEqual([
      { type: 'roundEnded', round: 1, word: '사과', reason: 'drawerLeft', correctIds: [] },
    ]);
    game.tick(13_000);
    expect(drawing(game).drawerId).toBe('B');
  });

  it('출제자보다 앞사람이 나가도 출제 순서가 밀리지 않는다', () => {
    const { game } = startedGame(['A', 'B', 'C']);
    game.tick(60_000);
    game.tick(63_000); // 2라운드: B 출제
    game.removePlayer('A', 64_000);
    game.tick(123_000);
    game.tick(126_000); // 3라운드
    expect(drawing(game).drawerId).toBe('C');
  });

  it('게임 중 한 명만 남으면 게임이 끝난다', () => {
    const { game } = startedGame(['A', 'B']);
    const events = game.removePlayer('B', 10_000);
    expect(types(events)).toEqual(['gameEnded']);
    expect(events[0]).toMatchObject({ reason: 'notEnoughPlayers' });
    expect(game.nextDeadline()).toBeNull();
  });

  it('없는 사람을 내보내도 아무 일도 없다 (REVIEW S4: 2017년에는 마지막 유저가 지워졌다)', () => {
    const { game } = startedGame(['A', 'B', 'C']);
    expect(game.removePlayer('Z', 10)).toEqual([]);
    expect(game.snapshot().players.map((p) => p.id)).toEqual(['A', 'B', 'C']);
  });
});
