// 방 하나의 게임 규칙.
//
// 소켓, 타이머, DB를 모른다. 현재 시각(now)과 단어 뽑기(pickWord)는 밖에서 받고,
// 상태를 바꾼 결과로 "무슨 일이 일어났는지"를 GameEvent 목록으로 돌려준다.
// 누구에게 어떻게 보낼지는 소켓 계층이 정한다.
import type {
  GameEndReason,
  GameSnapshot,
  Player,
  PlayerId,
  PublicGameEvent,
  PublicPhase,
  RoundEndReason,
} from '@brainreader/shared';

export interface GameSettings {
  maxPlayers: number;
  rounds: number;
  roundTimeMs: number;
  roundEndPauseMs: number;
}

// 점수 규칙. 정답자는 맞힌 순서대로 10, 8, 6, 4, 2, 2...점,
// 출제자는 누가 맞힐 때마다 2점을 받는다. 아무도 못 맞히면 출제자는 0점이다.
export const FIRST_GUESS_POINTS = 10;
export const GUESS_POINTS_STEP = 2;
export const MIN_GUESS_POINTS = 2;
export const DRAWER_POINTS_PER_GUESS = 2;

export function guessPoints(order: number): number {
  return Math.max(MIN_GUESS_POINTS, FIRST_GUESS_POINTS - (order - 1) * GUESS_POINTS_STEP);
}

export type Phase =
  | { kind: 'lobby' }
  | {
      kind: 'drawing';
      round: number;
      drawerId: PlayerId;
      word: string;
      endsAt: number;
      correctIds: PlayerId[]; // 맞힌 순서
    }
  | {
      kind: 'roundEnd';
      round: number;
      word: string;
      reason: RoundEndReason;
      correctIds: PlayerId[];
      nextAt: number;
    };

// 모두에게 알리는 이벤트(PublicGameEvent)에 출제와 채팅을 더한 것.
export type GameEvent =
  | PublicGameEvent
  // 정답 단어는 이 이벤트로만 나간다. 소켓 계층은 drawerId에게만 보내야 한다.
  | { type: 'wordAssigned'; round: number; drawerId: PlayerId; word: string }
  | { type: 'chat'; playerId: PlayerId; text: string };

export type GameErrorCode =
  | 'alreadyJoined'
  | 'roomFull'
  | 'unknownPlayer'
  | 'notInLobby'
  | 'drawerCannotChat'
  | 'alreadyGuessed';

export class GameError extends Error {
  constructor(public readonly code: GameErrorCode) {
    super(code);
  }
}

export const MIN_PLAYERS = 2;

export class Game {
  private readonly players: Player[] = []; // 입장 순서. 출제 순서도 이 순서를 따른다.
  private phase: Phase = { kind: 'lobby' };
  private round = 0;
  private drawerIndex = -1;

  constructor(
    private readonly settings: GameSettings,
    private readonly pickWord: () => string,
  ) {}

  addPlayer(id: PlayerId, name: string): GameEvent[] {
    if (this.findPlayer(id)) throw new GameError('alreadyJoined');
    if (this.players.length >= this.settings.maxPlayers) throw new GameError('roomFull');
    this.players.push({ id, name, ready: false, score: 0 });
    return [];
  }

  removePlayer(id: PlayerId, now: number): GameEvent[] {
    const index = this.players.findIndex((p) => p.id === id);
    if (index === -1) return [];

    this.players.splice(index, 1);
    // 출제자보다 앞자리(또는 출제자 본인)가 빠지면 한 칸씩 당겨진다.
    // 다음 출제자가 건너뛰어지지 않도록 인덱스도 같이 당긴다.
    if (index <= this.drawerIndex) this.drawerIndex -= 1;

    if (this.phase.kind === 'lobby') return this.tryStart(now);
    if (this.players.length < MIN_PLAYERS) return this.endGame('notEnoughPlayers');
    if (this.phase.kind === 'drawing' && this.phase.drawerId === id) {
      return this.endRound('drawerLeft', now);
    }
    // 아직 못 맞힌 사람이 나가서 남은 사람이 전부 맞힌 상태가 될 수 있다.
    return this.endRoundIfAllGuessed(now);
  }

  setReady(id: PlayerId, ready: boolean, now: number): GameEvent[] {
    if (this.phase.kind !== 'lobby') throw new GameError('notInLobby');
    this.requirePlayer(id).ready = ready;
    return this.tryStart(now);
  }

  // 채팅과 정답 시도는 같은 입력이다. 정답이면 채팅으로 퍼뜨리지 않는다.
  chat(id: PlayerId, text: string, now: number): GameEvent[] {
    const player = this.requirePlayer(id);
    const trimmed = text.trim();
    if (trimmed === '') return [];

    if (this.phase.kind === 'drawing') {
      const phase = this.phase;
      if (phase.drawerId === id) throw new GameError('drawerCannotChat');
      // 이미 맞힌 사람이 채팅하면 정답을 흘릴 수 있으므로 라운드가 끝날 때까지 막는다.
      if (phase.correctIds.includes(id)) throw new GameError('alreadyGuessed');

      if (normalize(trimmed) === normalize(phase.word)) {
        phase.correctIds.push(id);
        const order = phase.correctIds.length;
        const points = guessPoints(order);
        player.score += points;
        this.requirePlayer(phase.drawerId).score += DRAWER_POINTS_PER_GUESS;

        return [
          {
            type: 'correctGuess',
            playerId: id,
            order,
            points,
            drawerId: phase.drawerId,
            drawerPoints: DRAWER_POINTS_PER_GUESS,
          },
          ...this.endRoundIfAllGuessed(now),
        ];
      }
    }
    return [{ type: 'chat', playerId: id, text: trimmed }];
  }

  // 시간에 따른 전이. 소켓 계층은 nextDeadline() 시각에 이 함수를 부른다.
  tick(now: number): GameEvent[] {
    if (this.phase.kind === 'drawing' && now >= this.phase.endsAt) {
      return this.endRound('timeout', now);
    }
    if (this.phase.kind === 'roundEnd' && now >= this.phase.nextAt) {
      return this.round >= this.settings.rounds ? this.endGame('finished') : this.startRound(now);
    }
    return [];
  }

  // 지금 그릴 수 있는 사람. 그리는 중이 아니면 아무도 없다.
  currentDrawer(): PlayerId | null {
    return this.phase.kind === 'drawing' ? this.phase.drawerId : null;
  }

  nextDeadline(): number | null {
    if (this.phase.kind === 'drawing') return this.phase.endsAt;
    if (this.phase.kind === 'roundEnd') return this.phase.nextAt;
    return null;
  }

  snapshot(): GameSnapshot {
    const players = this.players.map((p) => ({ ...p }));
    let phase: PublicPhase;
    if (this.phase.kind === 'drawing') {
      const { word: _word, ...rest } = this.phase;
      phase = { ...rest, correctIds: [...rest.correctIds] };
    } else if (this.phase.kind === 'roundEnd') {
      phase = { ...this.phase, correctIds: [...this.phase.correctIds] };
    } else {
      phase = { kind: 'lobby' };
    }
    return { players, phase, rounds: this.settings.rounds };
  }

  private tryStart(now: number): GameEvent[] {
    if (this.players.length < MIN_PLAYERS) return [];
    if (!this.players.every((p) => p.ready)) return [];

    for (const p of this.players) p.score = 0;
    this.round = 0;
    this.drawerIndex = -1;
    return [{ type: 'gameStarted' }, ...this.startRound(now)];
  }

  private startRound(now: number): GameEvent[] {
    this.round += 1;
    this.drawerIndex = (this.drawerIndex + 1) % this.players.length;
    const drawer = this.players[this.drawerIndex]!;
    const word = this.pickWord();
    const endsAt = now + this.settings.roundTimeMs;

    this.phase = {
      kind: 'drawing',
      round: this.round,
      drawerId: drawer.id,
      word,
      endsAt,
      correctIds: [],
    };
    return [
      { type: 'roundStarted', round: this.round, drawerId: drawer.id, endsAt },
      { type: 'wordAssigned', round: this.round, drawerId: drawer.id, word },
    ];
  }

  private endRoundIfAllGuessed(now: number): GameEvent[] {
    if (this.phase.kind !== 'drawing') return [];
    const { drawerId, correctIds } = this.phase;
    const allGuessed = this.players.every((p) => p.id === drawerId || correctIds.includes(p.id));
    return allGuessed ? this.endRound('allGuessed', now) : [];
  }

  // 라운드를 끝내는 곳은 여기 하나뿐이다. 모두 정답, 시간 초과, 출제자 이탈이 모두 이 함수를 거친다.
  private endRound(reason: RoundEndReason, now: number): GameEvent[] {
    if (this.phase.kind !== 'drawing') return [];
    const { round, word, correctIds } = this.phase;
    this.phase = {
      kind: 'roundEnd',
      round,
      word,
      reason,
      correctIds,
      nextAt: now + this.settings.roundEndPauseMs,
    };
    return [{ type: 'roundEnded', round, word, reason, correctIds: [...correctIds] }];
  }

  private endGame(reason: GameEndReason): GameEvent[] {
    const ranking = [...this.players].sort((a, b) => b.score - a.score).map((p) => ({ ...p }));
    this.phase = { kind: 'lobby' };
    for (const p of this.players) p.ready = false;
    return [{ type: 'gameEnded', reason, ranking }];
  }

  private findPlayer(id: PlayerId): Player | undefined {
    return this.players.find((p) => p.id === id);
  }

  private requirePlayer(id: PlayerId): Player {
    const player = this.findPlayer(id);
    if (!player) throw new GameError('unknownPlayer');
    return player;
  }
}

// 띄어쓰기와 대소문자는 정답 판정에서 무시한다.
function normalize(text: string): string {
  return text.replace(/\s+/g, '').toLowerCase();
}
