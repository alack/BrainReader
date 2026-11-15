import type { AppSocket } from './socket-types.ts';

// 지금 접속해 있는 유저 = 지금 연결된 소켓. 둘을 따로 관리하지 않는다.
// 유저 하나에 소켓 하나만 허용하고, 새로 접속하면 이전 연결을 끊는다.
export class Presence {
  private readonly sockets = new Map<string, AppSocket>();

  connect(userId: string, socket: AppSocket) {
    const previous = this.sockets.get(userId);
    if (previous) {
      previous.emit('session:replaced');
      previous.disconnect(true);
    }
    this.sockets.set(userId, socket);
  }

  // 같은 유저의 새 연결이 이미 들어와 있으면 그 연결은 지우지 않는다.
  release(userId: string, socket: AppSocket) {
    if (this.sockets.get(userId) === socket) this.sockets.delete(userId);
  }

  get(userId: string): AppSocket | undefined {
    return this.sockets.get(userId);
  }

  disconnect(userId: string) {
    this.sockets.get(userId)?.disconnect(true);
  }

  users() {
    return [...this.sockets.values()].map((s) => ({
      id: s.data.user.id,
      username: s.data.user.username,
      roomId: s.data.roomId ?? null,
    }));
  }
}
