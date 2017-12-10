export class Room {
  name: string;
  password: string;
  type: string;
  maxUser: number;
  userCount: number;
  users: string[];
  painter: string;
  mode: boolean; // false : human, true : com
  gaming: boolean;
}
