export class Room {
  name: string;
  password: string;
  type: string;
  maxUser: number;
  users: string[];
  painter: string;
  mode: boolean; // false : human, true : com
  gamecnt: number; // 이방에서 설정한 게임 수
  curcnt: number; // 현재 게임수는 1부터 카운트해서 올라감 gamecnt가 되면 초기화 시키고 처음 상태로 돌아감
  timeOut: number; // curcnt가 0이면 게임이 시작하지 않은것!
  remainSec: number;
}
