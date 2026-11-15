import { randomUUID } from 'node:crypto';
import type { RoomSummary, RoomView } from '@brainreader/shared';
import { Game } from '../game/game.ts';

const ROUND_END_PAUSE_MS = 3_000;

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
}

// 방은 서버 메모리에만 있다. 서버가 재시작하면 방은 사라지고 유저와 단어(DB)만 남는다.
export class RoomManager {
  private readonly rooms = new Map<string, Room>();

  constructor(private readonly pickWord: () => string) {}

  create(settings: RoomSettings): Room {
    const room: Room = {
      ...settings,
      id: randomUUID(),
      game: new Game(
        {
          maxPlayers: settings.maxPlayers,
          rounds: settings.rounds,
          roundTimeMs: settings.roundTimeSec * 1000,
          roundEndPauseMs: ROUND_END_PAUSE_MS,
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

  delete(id: string) {
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
