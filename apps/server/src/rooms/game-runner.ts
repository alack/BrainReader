import type { GameEvent } from '../game/game.ts';
import type { Presence } from '../presence.ts';
import type { AppServer } from '../socket-types.ts';
import type { Room, RoomManager } from './room-manager.ts';

export const roomChannel = (roomId: string) => `room:${roomId}`;

// Game이 돌려준 이벤트를 소켓 메시지로 바꾸고, 다음 시간 전이를 예약한다.
// Game은 "무슨 일이 일어났는가"만 말하고, "누구에게 보내는가"는 여기서 정한다.
export function createGameRunner({ io, rooms, presence }: { io: AppServer; rooms: RoomManager; presence: Presence }) {
  const emitRoomState = (room: Room) => {
    io.to(roomChannel(room.id)).emit('room:state', rooms.view(room));
  };

  const apply = (room: Room, events: GameEvent[]) => {
    const channel = io.to(roomChannel(room.id));
    for (const event of events) {
      switch (event.type) {
        case 'wordAssigned':
          // 정답 단어는 출제자 소켓 하나에만 보낸다.
          presence.get(event.drawerId)?.emit('round:word', { round: event.round, word: event.word });
          break;
        case 'chat': {
          const sender = room.game.snapshot().players.find((p) => p.id === event.playerId);
          channel.emit('room:chat', {
            userId: event.playerId,
            username: sender?.name ?? '',
            text: event.text,
            sentAt: Date.now(),
          });
          break;
        }
        case 'roundStarted':
          room.strokes = [];
          channel.emit('draw:clear');
          channel.emit('game:event', event);
          break;
        default:
          channel.emit('game:event', event);
      }
    }
    // 채팅만 있었다면 방 상태는 그대로다.
    if (events.some((e) => e.type !== 'chat')) emitRoomState(room);
    schedule(room);
  };

  // 방마다 타이머는 하나뿐이다. 다음에 깨어날 시각은 Game이 알려 준다 (REVIEW 2-4).
  const schedule = (room: Room) => {
    if (room.timer) clearTimeout(room.timer);
    room.timer = undefined;
    const deadline = room.game.nextDeadline();
    if (deadline === null) return;
    room.timer = setTimeout(
      () => {
        room.timer = undefined;
        if (rooms.get(room.id) !== room) return; // 그 사이 방이 사라졌다
        apply(room, room.game.tick(Date.now()));
      },
      Math.max(0, deadline - Date.now()),
    );
  };

  return { apply, emitRoomState };
}

export type GameRunner = ReturnType<typeof createGameRunner>;
