// 게임 상태 중 클라이언트에게 보여 줘도 되는 부분의 타입.
// 규칙 자체는 서버(apps/server/src/game/game.ts)에만 있다.

export type PlayerId = string;

export interface Player {
  id: PlayerId;
  name: string;
  ready: boolean;
  score: number;
}

export type RoundEndReason = 'allGuessed' | 'timeout' | 'drawerLeft';

// 출제 중인 단어는 여기 없다. 출제자에게만 따로 보낸다.
export type PublicPhase =
  | { kind: 'lobby' }
  | { kind: 'drawing'; round: number; drawerId: PlayerId; endsAt: number; correctIds: PlayerId[] }
  | {
      kind: 'roundEnd';
      round: number;
      word: string;
      reason: RoundEndReason;
      correctIds: PlayerId[];
      nextAt: number;
    };

export interface GameSnapshot {
  players: Player[];
  phase: PublicPhase;
  rounds: number;
}
