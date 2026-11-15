import { z } from 'zod';

// 서버는 요청 검증에, 웹은 입력 폼 검증에 같은 규칙을 쓴다.
export const credentialsSchema = z.object({
  username: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9_가-힣]{2,16}$/, '아이디는 한글, 영문, 숫자, _로 2~16자'),
  password: z.string().min(8, '비밀번호는 8자 이상').max(128, '비밀번호는 128자 이하'),
});

export type Credentials = z.infer<typeof credentialsSchema>;

// 클라이언트로 나가는 유저 정보는 이 모양뿐이다. 비밀번호 해시 같은 DB 칼럼은 여기 없다.
// id는 API에서 항상 문자열이다. DB 정수 id를 문자열로 바꾸는 곳은 toPublicUser 하나뿐이다.
export interface PublicUser {
  id: string;
  username: string;
}
