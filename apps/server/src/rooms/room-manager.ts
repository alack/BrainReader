import { randomUUID } from 'node:crypto';
import type { RoomSummary, RoomView, Stroke } from '@brainreader/shared';
import { Game } from '../game/game.ts';

export interface RoomSettings {
  name: string;
  passwordHash: string | null;
  maxPlayers: number;
  rounds: number;
  roundTimeSec: number;
}

export interface Room extends RoomSettings {
  id: string;
  game: Game; // 방에 누가 있는지는 game의 플레이어 목록 하나로만 관리한다.
  strokes: Stroke[]; // 이번 라운드에 그린 획. 늦게 들어온 사람에게 다시 보낸다.
  timer?: ReturnType<typeof setTimeout>; // 다음 시간 전이(시간 초과, 다음 라운드)를 깨우는 타이머
}

export interface RoomTiming {
  roundEndPauseMs: number;
  msPerSecond: number; // 테스트에서 시간을 줄이려고만 바꾼다. 실제 서버는 1000.
}

const DEFAULT_TIMING: RoomTiming = { roundEndPauseMs: 3_000, msPerSecond: 1_000 };

// 방은 서버 메모리에만 있다. 서버가 재시작하면 방은 사라지고 유저와 단어(DB)만 남는다.
export class RoomManager {
  private readonly rooms = new Map<string, Room>();

  constructor(
    private readonly pickWord: () => string,
    private readonly timing: RoomTiming = DEFAULT_TIMING,
  ) {}

  create(settings: RoomSettings): Room {
    const room: Room = {
      ...settings,
      id: randomUUID(),
      strokes: [],
      game: new Game(
        {
          maxPlayers: settings.maxPlayers,
          rounds: settings.rounds,
          roundTimeMs: settings.roundTimeSec * this.timing.msPerSecond,
          roundEndPauseMs: this.timing.roundEndPauseMs,
        },
        this.pickWord,
      ),
    };
    this.rooms.set(room.id, room);
    return room;
  }

  get(id: string): Room | undefined {
    return this.rooms.get(id);
  }

  // 방을 지울 때 타이머도 같이 지운다. 안 지우면 사라진 방의 타이머가 나중에 깨어난다.
  delete(id: string) {
    const room = this.rooms.get(id);
    if (room?.timer) clearTimeout(room.timer);
    this.rooms.delete(id);
  }

  summaries(): RoomSummary[] {
    return [...this.rooms.values()].map((room) => {
      const { players, phase } = room.game.snapshot();
      return {
        id: room.id,
        name: room.name,
        locked: room.passwordHash !== null,
        playerCount: players.length,
        maxPlayers: room.maxPlayers,
        playing: phase.kind !== 'lobby',
      };
    });
  }

  view(room: Room): RoomView {
    return {
      id: room.id,
      name: room.name,
      locked: room.passwordHash !== null,
      maxPlayers: room.maxPlayers,
      rounds: room.rounds,
      roundTimeSec: room.roundTimeSec,
      game: room.game.snapshot(),
    };
  }
}
