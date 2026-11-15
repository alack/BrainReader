const ERROR_TEXT: Record<string, string> = {
  invalidInput: '입력 형식이 맞지 않습니다.',
  alreadyInRoom: '이미 다른 방에 들어가 있습니다.',
  roomNotFound: '방이 없어졌습니다.',
  wrongPassword: '비밀번호가 맞지 않습니다.',
  roomFull: '방이 꽉 찼습니다.',
  notInRoom: '방에 들어가 있지 않습니다.',
  drawerCannotChat: '출제자는 채팅할 수 없습니다.',
  alreadyGuessed: '정답을 맞힌 사람은 라운드가 끝날 때까지 채팅할 수 없습니다.',
  timeout: '서버 응답이 없습니다.',
};

export function errorText(code: string): string {
  return ERROR_TEXT[code] ?? '알 수 없는 오류가 났습니다.';
}
